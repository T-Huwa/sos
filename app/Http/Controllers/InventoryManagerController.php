<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Donation;
use App\Models\DonatedItem;
use App\Models\Inventory;
use App\Models\InventoryAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryManagerController extends Controller
{
    /**
     * Display the inventory manager dashboard
     */
    public function dashboard()
    {
        // Get total children count
        $totalChildren = Child::count();
        
        // Get children count from this month
        $childrenThisMonth = Child::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        // Get active donors (users who have made donations)
        $activeDonors = Donation::distinct('user_id')
            ->whereNotNull('user_id')
            ->count();
        
        // Add anonymous/guest donors
        $anonymousDonors = Donation::where(function($query) {
            $query->whereNotNull('anonymous_name')
                  ->orWhereNotNull('guest_name');
        })->count();
        
        $totalActiveDonors = $activeDonors + $anonymousDonors;
        
        // Get urgent cases (children who haven't received donations recently)
        $urgentCases = Child::whereDoesntHave('donations', function($query) {
            $query->where('created_at', '>=', now()->subDays(30));
        })->count();
        
        // Get inventory statistics
        $totalInventoryItems = Inventory::sum('quantity');
        $totalItemTypes = Inventory::distinct('item_name')->count();
        
        // Calculate critical and low stock items
        $inventoryItems = Inventory::select('item_name')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->groupBy('item_name')
            ->get();
        
        $criticalItems = $inventoryItems->filter(function($item) {
            return $item->total_quantity <= 5;
        })->count();
        
        $lowStockItems = $inventoryItems->filter(function($item) {
            return $item->total_quantity > 5 && $item->total_quantity <= 15;
        })->count();
        
        // Get recent item donations (last 5)
        $recentDonations = Donation::with(['items', 'user', 'child'])
            ->where('donation_type', 'goods')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'created_at' => $donation->created_at->format('M d, Y'),
                    'donor_name' => $donation->user 
                        ? $donation->user->name 
                        : ($donation->anonymous_name ?: $donation->guest_name ?: 'Anonymous'),
                    'child_name' => $donation->child ? $donation->child->first_name . ' ' . $donation->child->last_name : 'General',
                    'items_count' => $donation->items->count(),
                    'total_quantity' => $donation->items->sum('quantity'),
                ];
            });
        
        return Inertia::render('inventory/dashboard', [
            'dashboardData' => [
                'totalChildren' => $totalChildren,
                'childrenThisMonth' => $childrenThisMonth,
                'activeDonors' => $totalActiveDonors,
                'urgentCases' => $urgentCases,
                'totalInventoryItems' => $totalInventoryItems,
                'totalItemTypes' => $totalItemTypes,
                'criticalItems' => $criticalItems,
                'lowStockItems' => $lowStockItems,
                'recentDonations' => $recentDonations,
            ]
        ]);
    }

    /**
     * Show the mass requisition form
     */
    public function showMassRequisition()
    {
        // Get existing inventory items for editing (simplified without category/location)
        $existingItems = Inventory::select('item_name')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->selectRaw('MAX(threshold) as threshold')
            ->groupBy('item_name')
            ->orderBy('item_name')
            ->get()
            ->map(function ($item) {
                return [
                    'item_name' => $item->item_name,
                    'current_quantity' => $item->total_quantity,
                    'threshold' => $item->threshold ?? 20,
                ];
            });

        return Inertia::render('inventory/mass-requisition', [
            'existingItems' => $existingItems,
        ]);
    }

    /**
     * Process mass requisition
     */
    public function processMassRequisition(Request $request)
    {
        // Debug: Log the incoming request data
        \Log::info('Mass requisition request received', [
            'all_data' => $request->all(),
            'new_items' => $request->input('new_items'),
            'adjustments' => $request->input('adjustments'),
        ]);

        $validated = $request->validate([
            'new_items' => 'array',
            'new_items.*.item_name' => 'required|string|max:255',
            'new_items.*.quantity' => 'required|integer|min:1',
            'new_items.*.threshold' => 'nullable|integer|min:1',
            'new_items.*.reason' => 'required|string|max:500',
            'new_items.*.notes' => 'nullable|string|max:1000',

            'adjustments' => 'array',
            'adjustments.*.item_name' => 'required|string|max:255',
            'adjustments.*.quantity_change' => 'required|integer|not_in:0',
            'adjustments.*.reason' => 'required|string|max:500',
            'adjustments.*.notes' => 'nullable|string|max:1000',
        ]);

        \Log::info('Mass requisition validation passed', ['validated' => $validated]);

        try {
            DB::beginTransaction();

            $results = [
                'new_items_created' => 0,
                'adjustments_made' => 0,
                'errors' => [],
            ];

            // Process new items
            if (!empty($validated['new_items'])) {
                foreach ($validated['new_items'] as $newItem) {
                    try {
                        // Check if item already exists
                        $existingItem = Inventory::where('item_name', $newItem['item_name'])->first();

                        if ($existingItem) {
                            $results['errors'][] = "Item '{$newItem['item_name']}' already exists";
                            continue;
                        }

                        // Create new inventory item
                        $inventory = Inventory::create([
                            'item_name' => $newItem['item_name'],
                            'quantity' => $newItem['quantity'],
                            'category' => 'General', // Default category
                            'location' => 'Warehouse', // Default location
                            'threshold' => $newItem['threshold'] ?? 20,
                        ]);

                        // Create adjustment record
                        InventoryAdjustment::create([
                            'item_name' => $newItem['item_name'],
                            'adjustment_type' => 'new_item',
                            'quantity_change' => $newItem['quantity'],
                            'quantity_before' => 0,
                            'quantity_after' => $newItem['quantity'],
                            'reason' => $newItem['reason'],
                            'notes' => $newItem['notes'],
                            'category' => 'General',
                            'location' => 'Warehouse',
                            'adjusted_by' => Auth::id(),
                        ]);

                        $results['new_items_created']++;
                    } catch (\Exception $e) {
                        $results['errors'][] = "Failed to create item '{$newItem['item_name']}': " . $e->getMessage();
                    }
                }
            }

            // Process adjustments
            if (!empty($validated['adjustments'])) {
                foreach ($validated['adjustments'] as $adjustment) {
                    try {
                        // Find existing inventory items
                        $inventoryItems = Inventory::where('item_name', $adjustment['item_name'])->get();

                        if ($inventoryItems->isEmpty()) {
                            $results['errors'][] = "Item '{$adjustment['item_name']}' not found";
                            continue;
                        }

                        $totalCurrentQuantity = $inventoryItems->sum('quantity');
                        $quantityChange = $adjustment['quantity_change'];
                        $newTotalQuantity = $totalCurrentQuantity + $quantityChange;

                        // Check if adjustment would result in negative quantity
                        if ($newTotalQuantity < 0) {
                            $results['errors'][] = "Cannot reduce '{$adjustment['item_name']}' by {$quantityChange}. Current quantity: {$totalCurrentQuantity}";
                            continue;
                        }

                        // If increasing quantity, add to the first item or create new entry
                        if ($quantityChange > 0) {
                            $firstItem = $inventoryItems->first();
                            $firstItem->adjustQuantity(
                                $quantityChange,
                                $adjustment['reason'],
                                $adjustment['notes']
                            );
                        } else {
                            // If decreasing, distribute the reduction across items
                            $remainingReduction = abs($quantityChange);

                            foreach ($inventoryItems as $item) {
                                if ($remainingReduction <= 0) break;

                                $reductionForThisItem = min($item->quantity, $remainingReduction);
                                $item->adjustQuantity(
                                    -$reductionForThisItem,
                                    $adjustment['reason'],
                                    $adjustment['notes']
                                );

                                $remainingReduction -= $reductionForThisItem;
                            }
                        }

                        $results['adjustments_made']++;
                    } catch (\Exception $e) {
                        $results['errors'][] = "Failed to adjust '{$adjustment['item_name']}': " . $e->getMessage();
                    }
                }
            }

            DB::commit();

            // Redirect back with success message
            return redirect()->route('inventory.mass-requisition')->with('success', [
                'message' => 'Mass requisition processed successfully!',
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Redirect back with error message
            return redirect()->route('inventory.mass-requisition')->with('error', [
                'message' => 'Failed to process mass requisition: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Adjust quantity for a specific inventory item
     */
    public function adjustQuantity(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|integer|exists:inventories,id',
            'quantity_change' => 'required|integer|not_in:0',
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Find the inventory item
            $item = Inventory::findOrFail($validated['item_id']);

            $oldQuantity = $item->quantity;
            $newQuantity = $oldQuantity + $validated['quantity_change'];

            // Check if adjustment would result in negative quantity
            if ($newQuantity < 0) {
                return redirect()->back()->with('error', [
                    'message' => "Cannot reduce '{$item->item_name}' by " . abs($validated['quantity_change']) . ". Current quantity: {$oldQuantity}"
                ]);
            }

            // Use the adjustQuantity method from the Inventory model
            $item->adjustQuantity(
                $validated['quantity_change'],
                $validated['reason'],
                $validated['notes'] ?? null
            );

            DB::commit();

            $adjustmentType = $validated['quantity_change'] > 0 ? 'increased' : 'decreased';
            $amount = abs($validated['quantity_change']);

            Log::info('Inventory quantity adjusted', [
                'item_id' => $item->id,
                'item_name' => $item->item_name,
                'old_quantity' => $oldQuantity,
                'new_quantity' => $newQuantity,
                'change' => $validated['quantity_change'],
                'reason' => $validated['reason'],
                'adjusted_by' => Auth::id(),
            ]);

            return redirect()->back()->with('success', [
                'message' => "Successfully {$adjustmentType} {$item->item_name} by {$amount}. New quantity: {$newQuantity}"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Inventory quantity adjustment failed', [
                'item_id' => $validated['item_id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', [
                'message' => 'Failed to adjust quantity. Please try again.'
            ]);
        }
    }
}

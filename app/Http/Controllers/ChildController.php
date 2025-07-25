<?php
// app/Http/Controllers/ChildrenController.php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChildController extends Controller
{

    public function getDonations()
    {
        $donations = Donation::with(['items', 'user', 'child'])
            ->latest()
            ->get()
            ->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'created_at' => $donation->created_at,
                    'donation_type' => $donation->donation_type,
                    'amount' => $donation->amount,
                    'status' => $donation->status,
                    'description' => $donation->description,
                    'donor_name' => $donation->user
                        ? $donation->user->name
                        : ($donation->anonymous_name ?: $donation->guest_name),
                    'donor_email' => $donation->user
                        ? $donation->user->email
                        : ($donation->anonymous_email ?: $donation->guest_email),
                    'child_name' => $donation->child
                        ? $donation->child->first_name . ' ' . $donation->child->last_name
                        : null,
                    'is_anonymous' => $donation->is_anonymous || !$donation->user,
                    'items' => $donation->items->map(function ($item) use ($donation) {
                        // Check if this item is already in inventory
                        $inInventory = \App\Models\Inventory::where('item_name', $item->item_name)
                            ->where('source_donation_id', $donation->id)
                            ->exists();

                        return [
                            'id' => $item->id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'estimated_value' => $item->estimated_value,
                            'in_inventory' => $inInventory,
                        ];
                    }),
                ];
            });

        return Inertia::render('inventory/donations', [
            'donations' => $donations,
        ]);
    }

    public function addDonationToInventory(Request $request, $donationId)
    {
        try {
            $donation = Donation::with('items')->findOrFail($donationId);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        // Validate donation type
        if ($donation->donation_type !== 'goods') {
            return response()->json([
                'message' => 'Only item donations can be added to inventory',
                'error_type' => 'invalid_donation_type'
            ], 400);
        }

        // Validate donation status
        if ($donation->status !== 'received') {
            return response()->json([
                'message' => 'Only received donations can be added to inventory',
                'error_type' => 'invalid_status',
                'current_status' => $donation->status
            ], 400);
        }

        // Check if donation has items
        if (!$donation->items || $donation->items->count() === 0) {
            return response()->json([
                'message' => 'This donation has no items to add to inventory',
                'error_type' => 'no_items'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $addedItems = [];
            $skippedItems = [];
            $errorItems = [];

            foreach ($donation->items as $item) {
                try {
                    // Check if this specific donation item already exists in inventory
                    $existingInventory = \App\Models\Inventory::where('item_name', $item->item_name)
                        ->where('source_donation_id', $donation->id)
                        ->first();

                    if (!$existingInventory) {
                        // Validate item data
                        if (empty($item->item_name) || $item->quantity <= 0) {
                            $errorItems[] = $item->item_name ?: 'Unknown item';
                            continue;
                        }

                        \App\Models\Inventory::create([
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'category' => $this->categorizeItem($item->item_name),
                            'source_donation_id' => $donation->id,
                            'location' => 'warehouse', // Default location
                        ]);

                        $addedItems[] = [
                            'name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'category' => $this->categorizeItem($item->item_name)
                        ];
                    } else {
                        $skippedItems[] = $item->item_name;
                    }
                } catch (\Exception $e) {
                    $errorItems[] = $item->item_name;
                    \Log::error('Failed to add item to inventory', [
                        'item_id' => $item->id,
                        'item_name' => $item->item_name,
                        'donation_id' => $donation->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();

            // Build detailed response message
            $message = '';
            $details = [];

            if (count($addedItems) > 0) {
                $itemsList = array_map(function($item) {
                    return $item['name'] . ' (Qty: ' . $item['quantity'] . ')';
                }, $addedItems);
                $message .= 'Successfully added to inventory: ' . implode(', ', $itemsList);
                $details['added_items'] = $addedItems;
            }

            if (count($skippedItems) > 0) {
                if ($message) $message .= '. ';
                $message .= 'Already in inventory: ' . implode(', ', $skippedItems);
                $details['skipped_items'] = $skippedItems;
            }

            if (count($errorItems) > 0) {
                if ($message) $message .= '. ';
                $message .= 'Failed to process: ' . implode(', ', $errorItems);
                $details['error_items'] = $errorItems;
            }

            return response()->json([
                'message' => $message ?: 'No items were processed',
                'added_count' => count($addedItems),
                'skipped_count' => count($skippedItems),
                'error_count' => count($errorItems),
                'details' => $details,
                'success' => count($addedItems) > 0
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Failed to add donation to inventory', [
                'donation_id' => $donationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to add items to inventory due to a system error',
                'error_type' => 'system_error'
            ], 500);
        }
    }

    public function getInventory()
    {
        $inventoryItems = \App\Models\Inventory::select('item_name', 'category', 'location')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->selectRaw('COUNT(DISTINCT source_donation_id) as donation_count')
            ->selectRaw('MIN(created_at) as first_added')
            ->selectRaw('MAX(created_at) as last_updated')
            ->groupBy('item_name', 'category', 'location')
            ->orderBy('item_name')
            ->get()
            ->map(function ($item) {
                // Calculate status based on quantity thresholds
                $status = 'Good';
                $threshold = 20; // Default threshold

                if ($item->total_quantity <= 5) {
                    $status = 'Critical';
                } elseif ($item->total_quantity <= 15) {
                    $status = 'Low';
                }

                return [
                    'item_name' => $item->item_name,
                    'total_quantity' => $item->total_quantity,
                    'category' => $item->category,
                    'location' => $item->location,
                    'donation_count' => $item->donation_count,
                    'first_added' => $item->first_added,
                    'last_updated' => $item->last_updated,
                    'status' => $status,
                    'threshold' => $threshold,
                ];
            });

        // Get summary statistics
        $totalItems = $inventoryItems->sum('total_quantity');
        $totalItemTypes = $inventoryItems->count();
        $criticalItems = $inventoryItems->where('status', 'Critical')->count();
        $lowStockItems = $inventoryItems->where('status', 'Low')->count();

        return Inertia::render('inventory/inventory', [
            'inventoryItems' => $inventoryItems,
            'statistics' => [
                'total_items' => $totalItems,
                'total_item_types' => $totalItemTypes,
                'critical_items' => $criticalItems,
                'low_stock_items' => $lowStockItems,
            ],
        ]);
    }

    private function categorizeItem($itemName)
    {
        $itemName = strtolower($itemName);

        if (str_contains($itemName, 'school') || str_contains($itemName, 'book') || str_contains($itemName, 'pen') || str_contains($itemName, 'pencil') || str_contains($itemName, 'uniform')) {
            return 'education';
        } elseif (str_contains($itemName, 'food') || str_contains($itemName, 'meal') || str_contains($itemName, 'nutrition')) {
            return 'nutrition';
        } elseif (str_contains($itemName, 'cloth') || str_contains($itemName, 'shirt') || str_contains($itemName, 'dress') || str_contains($itemName, 'shoe')) {
            return 'clothing';
        } elseif (str_contains($itemName, 'medical') || str_contains($itemName, 'medicine') || str_contains($itemName, 'health')) {
            return 'medical';
        } elseif (str_contains($itemName, 'toy') || str_contains($itemName, 'game') || str_contains($itemName, 'play')) {
            return 'recreation';
        } else {
            return 'general';
        }
    }

    public function index()
    {
        return Child::select('id', 'first_name', 'last_name')->get();
    }

    public function show($id)
    {
        $child = Child::findOrFail($id);
        return Inertia::render('ChildViewPage', [
            'child' => $child
        ]);
    }

    public function showEditable($id)
    {
        $child = Child::findOrFail($id);
        return Inertia::render('inventory/child', [
            'child' => $child,
            'donations' => $child->donations()->with(['donor', 'items'])->get(),
            'donors' => $child->donors()->distinct()->get(),
        ]);
    }

    public function showSec($id)
    {
        $child = Child::findOrFail($id);
        return Inertia::render('inventory/child', [
            'child' => $child,
            'donations' => $child->donations()->with(['donor', 'items'])->get(),
            'donors' => $child->donors()->distinct()->get(),
        ]);
    }

    public function indexForDonors()
    {
        $children = Child::with(['donations' => function($q) {
            $q->where('status', 'received');
        }])
        ->paginate(12);

        // Add computed fields for each child
        $children->getCollection()->transform(function ($child) {
            // Calculate total donations received
            $child->total_donations = $child->donations->where('donation_type', 'money')->sum('amount');
            $child->donation_count = $child->donations->count();

            // Add sample progress data if not available
            $child->academic_performance = $child->academic_performance ?? rand(70, 95);
            $child->health_status = $child->health_status ?? collect(['Excellent', 'Good', 'Fair'])->random();

            return $child;
        });

        return Inertia::render('donor/children', [
            'children' => $children,
        ]);
    }

    public function showToDonor($id)
    {
        $child = Child::findOrFail($id);

        // Add sample data if not available
        $child->academic_performance = $child->academic_performance ?? rand(70, 95);
        $child->health_status = $child->health_status ?? collect(['Excellent', 'Good', 'Fair'])->random();
        $child->last_health_checkup = $child->last_health_checkup ?? now()->subDays(rand(30, 90))->format('Y-m-d');
        $child->favorite_subjects = $child->favorite_subjects ?? 'Mathematics, English, Science';
        $child->dreams = $child->dreams ?? 'To become a doctor and help people in my community';
        $child->hobbies = $child->hobbies ?? 'Reading, playing football, drawing';
        $child->guardian_name = $child->guardian_name ?? 'Mary ' . $child->first_name;
        $child->guardian_contact = $child->guardian_contact ?? '+265 ' . rand(100000000, 999999999);

        return Inertia::render('donor/child', [
            'child' => $child,
            'donations' => $child->donations()->with(['donor', 'items'])->get(),
            'donors' => $child->donors()->distinct()->get(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120', // 5MB max
                'date_of_birth' => 'required|date|before:today',
                'gender' => 'required|in:male,female,other',
                'health_status' => 'nullable|string|max:255',
                'education_level' => 'nullable|string|max:255',
                'last_location' => 'nullable|string|max:255',
            ]);

            // Handle file upload with error checking
            if ($request->hasFile('image')) {
                $file = $request->file('image');

                if ($file->isValid()) {
                    $path = $file->store('children', 'public');
                    if (!$path) {
                        return response()->json([
                            'message' => 'Failed to upload image. Please try again.',
                            'error' => 'file_upload_failed'
                        ], 500);
                    }
                    $validated['image'] = $path;
                } else {
                    return response()->json([
                        'message' => 'Invalid image file. Please select a valid image.',
                        'error' => 'invalid_file'
                    ], 422);
                }
            }

            $child = Child::create($validated);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Child added successfully!',
                    'child' => $child
                ], 201);
            }

            return redirect()->back()->with('success', 'Child added successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Child creation failed: ' . $e->getMessage(), [
                'request_data' => $request->except(['image']),
                'error' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'An error occurred while creating the child. Please try again.',
                    'error' => 'creation_failed'
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to add child. Please try again.');
        }
    }

    public function update(Request $request, $id)
    {
        $child = Child::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'image' => 'nullable|image',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'health_status' => 'nullable|string',
            'education_level' => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('children', 'public');
        }

        $child->update($validated);

        return back()->with('success', 'Child updated.');
    }

    public function destroy($id)
    {
        $child = Child::findOrFail($id);
        $child->delete();

        return redirect()->route('inventory.children')->with('success', 'Child soft-deleted.');
    }

}

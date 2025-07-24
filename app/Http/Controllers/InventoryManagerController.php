<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Donation;
use App\Models\DonatedItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
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
}

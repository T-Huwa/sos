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
                    'items' => $donation->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'estimated_value' => $item->estimated_value,
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
        $donation = Donation::with('items')->findOrFail($donationId);

        if ($donation->donation_type !== 'goods' || $donation->status !== 'received') {
            return response()->json(['message' => 'Only received item donations can be added to inventory'], 400);
        }

        try {
            DB::beginTransaction();

            foreach ($donation->items as $item) {
                // Check if item already exists in inventory
                $existingInventory = \App\Models\Inventory::where('item_name', $item->item_name)
                    ->where('source_donation_id', $donation->id)
                    ->first();

                if (!$existingInventory) {
                    \App\Models\Inventory::create([
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'category' => 'donated_items', // Default category
                        'source_donation_id' => $donation->id,
                        'location' => 'warehouse', // Default location
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Items successfully added to inventory']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add items to inventory'], 500);
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
            'donations' => $child->donations()->with('donor')->get(),
            'donors' => $child->donors()->distinct()->get(),
        ]);
    }

    public function showToDonor($id)
    {
        $child = Child::findOrFail($id);
        return Inertia::render('donor/child', [
            'child' => $child,
            'donations' => $child->donations()->with('donor')->get(),
            'donors' => $child->donors()->distinct()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'image' => 'required|image',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'health_status' => 'nullable|string',
            'education_level' => 'nullable|string',
        ]);

        $validated['image'] = $request->file('image')->store('children', 'public');

        Child::create($validated);

        return redirect()->back()->with('success', 'Child added successfully!');
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

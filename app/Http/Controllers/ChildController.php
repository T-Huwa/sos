<?php
// app/Http/Controllers/ChildrenController.php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChildController extends Controller
{
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

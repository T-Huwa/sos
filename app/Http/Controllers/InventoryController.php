<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Index', [
            'inventory' => Inventory::with('donation')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventory/Create');
    }

    public function store(Request $request)
    {
        Inventory::create($request->all());

        return redirect()->route('inventory.index');
    }

    public function show(Inventory $inventory)
    {
        return Inertia::render('Inventory/Show', [
            'inventory' => $inventory->load('donation', 'distributions'),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Distribution;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DistributionController extends Controller
{
    public function index()
    {
        return Inertia::render('Distributions/Index', [
            'distributions' => Distribution::with('inventory')->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Distributions/Create');
    }

    public function store(Request $request)
    {
        Distribution::create($request->all());

        return redirect()->route('distributions.index');
    }

    public function show(Distribution $distribution)
    {
        return Inertia::render('Distributions/Show', [
            'distribution' => $distribution->load('inventory'),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Sponsorship;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SponsorshipController extends Controller
{
    public function index()
    {
        return Inertia::render('Sponsorships/Index', [
            'sponsorships' => Sponsorship::with('sponsor', 'child')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sponsorships/Create');
    }

    public function store(Request $request)
    {
        Sponsorship::create($request->all());

        return redirect()->route('sponsorships.index');
    }

    public function show(Sponsorship $sponsorship)
    {
        return Inertia::render('Sponsorships/Show', [
            'sponsorship' => $sponsorship->load('sponsor', 'child'),
        ]);
    }
}

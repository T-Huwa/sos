<?php

namespace App\Http\Controllers;

use App\Models\ThankYouLetter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThankYouLetterController extends Controller
{
    public function index()
    {
        return Inertia::render('ThankYouLetters/Index', [
            'letters' => ThankYouLetter::with('donation')->get(),
        ]);
    }

    public function show(ThankYouLetter $thankYouLetter)
    {
        return Inertia::render('ThankYouLetters/Show', [
            'letter' => $thankYouLetter->load('donation'),
        ]);
    }
}

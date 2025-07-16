<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Donation;

class AnonymousDonationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'message' => 'nullable|string|max:255',
        ]);

        Donation::create([
            'user_id' => null, // because the donor is anonymous
            'amount' => $validated['amount'],
            'message' => $validated['message'] ?? null,
            'is_anonymous' => true,
        ]);

        return response()->json(['success' => true]);
    }
}

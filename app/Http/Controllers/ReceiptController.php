<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    public function index()
    {
        return Inertia::render('Receipts/Index', [
            'receipts' => Receipt::with('donation')->get(),
        ]);
    }

    public function show(Receipt $receipt)
    {
        return Inertia::render('Receipts/Show', [
            'receipt' => $receipt->load('donation'),
        ]);
    }
}

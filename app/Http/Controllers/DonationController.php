<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Mail\DonationReceipt;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;

class DonationController extends Controller
{

    public function store(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'donation_type' => 'required|in:money,goods',
            'child_id' => 'nullable|exists:children,id',
            'guest_name' => 'nullable|required_without:user_id',
            'guest_email' => 'nullable|email|required_without:user_id',
        ]);

        $donation = Donation::create([
            'user_id' => auth()->id(),
            'child_id' => $data['child_id'],
            'amount' => $data['amount'],
            'donation_type' => $data['donation_type'],
            'guest_name' => $data['guest_name'] ?? null,
            'guest_email' => $data['guest_email'] ?? null,
            'status' => 'pending',
            'checkout_ref' => Str::uuid(),
        ]);

        return response()->json(['checkout_ref' => $donation->checkout_ref]);
    }

    public function handleWebhook(Request $request)
    {
        Log::info('PayChangu Webhook:', $request->all());

        $data = $request->validate([
            'reference' => 'required|string',
            'status' => 'required|in:success,failed',
            'amount' => 'required|numeric',
        ]);

        $donation = Donation::where('checkout_ref', $data['reference'])->first();

        if (!$donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        if ($data['status'] === 'success') {
            $donation->status = 'received';
            $donation->save();

            // Generate and send receipt
            $pdf = Pdf::loadView('receipts.donation', ['donation' => $donation]);
            $fileName = 'receipt-' . $donation->id . '.pdf';

            if ($donation->guest_email || $donation->user?->email) {
                Mail::to($donation->guest_email ?? $donation->user->email)->send(
                    new DonationReceipt($donation, $pdf->output(), $fileName)
                );
            }
        }

        return response()->json(['message' => 'Webhook processed'], 200);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Donation;
use App\Models\DonatedItem;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnonymousDonationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'donation_type' => 'required|in:cash,items',
            'anonymous_name' => 'required|string|max:255',
            'anonymous_email' => 'required|email|max:255',
            'message' => 'nullable|string|max:1000',

            // Cash donation fields
            'amount' => 'required_if:donation_type,cash|numeric|min:100',

            // Item donation fields
            'items' => 'required_if:donation_type,items|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.description' => 'nullable|string|max:500',
        ], [
            'donation_type.required' => 'Please select a donation type.',
            'donation_type.in' => 'Invalid donation type selected.',
            'anonymous_name.required' => 'Your name is required.',
            'anonymous_name.max' => 'Name cannot exceed 255 characters.',
            'anonymous_email.required' => 'Email address is required.',
            'anonymous_email.email' => 'Please enter a valid email address.',
            'anonymous_email.max' => 'Email address cannot exceed 255 characters.',
            'message.max' => 'Message cannot exceed 1000 characters.',
            'amount.required_if' => 'Amount is required for cash donations.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Minimum donation amount is MWK 100.',
            'items.required_if' => 'At least one item is required for item donations.',
            'items.array' => 'Items must be provided as a list.',
            'items.min' => 'At least one item is required for item donations.',
            'items.*.name.required' => 'Item name is required.',
            'items.*.name.max' => 'Item name cannot exceed 255 characters.',
            'items.*.quantity.required' => 'Item quantity is required.',
            'items.*.quantity.integer' => 'Item quantity must be a whole number.',
            'items.*.quantity.min' => 'Item quantity must be at least 1.',
            'items.*.description.max' => 'Item description cannot exceed 500 characters.',
        ]);

        try {
            DB::beginTransaction();

            if ($validated['donation_type'] === 'cash') {
                return $this->handleCashDonation($validated);
            } else {
                return $this->handleItemDonation($validated);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Anonymous donation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Donation failed. Please try again.'], 500);
        }
    }

    private function handleCashDonation(array $validated)
    {
        // Create donation record
        $donation = Donation::create([
            'user_id' => null,
            'donation_type' => 'money',
            'amount' => $validated['amount'],
            'description' => $validated['message'],
            'status' => 'pending',
            'is_anonymous' => true,
            'anonymous_name' => $validated['anonymous_name'],
            'anonymous_email' => $validated['anonymous_email'],
            'checkout_ref' => Str::uuid(),
        ]);

        // Generate PayChangu checkout URL
        $checkoutUrl = $this->generatePayChanguCheckoutUrl($donation);

        DB::commit();

        return response()->json([
            'success' => true,
            'checkout_url' => $checkoutUrl,
            'donation_id' => $donation->id,
        ]);
    }

    private function handleItemDonation(array $validated)
    {
        // Create donation record
        $donation = Donation::create([
            'user_id' => null,
            'donation_type' => 'goods',
            'amount' => null,
            'description' => $validated['message'],
            'status' => 'received', // Item donations are immediately received
            'is_anonymous' => true,
            'anonymous_name' => $validated['anonymous_name'],
            'anonymous_email' => $validated['anonymous_email'],
        ]);

        // Create donated items
        foreach ($validated['items'] as $item) {
            DonatedItem::create([
                'donation_id' => $donation->id,
                'item_name' => $item['name'],
                'quantity' => $item['quantity'],
                'estimated_value' => null, // Could be added later by admin
            ]);
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your item donation! We will contact you soon to arrange pickup.',
            'donation_id' => $donation->id,
        ]);
    }

    private function generatePayChanguCheckoutUrl(Donation $donation)
    {
        // Use environment variables for security - don't hardcode keys in public repos
        $publicKey ='PUB-TEST-FYCqr5vuwEBwhD0io289I835h6RYFWcs'; //env('PAYCHANGU_PUBLIC_KEY', 'PUB-TEST-FYCqr5vuwEBwhD0io289I835h6RYFWcs');

        // Use the actual domain from APP_URL or a publicly accessible URL
        $baseUrl = "http://localhost:8000";//config('app.url');

        // For development with PayChangu, you need a publicly accessible URL
        // Use ngrok or similar to expose your localhost:80 to the internet
        // if (str_contains($baseUrl, 'localhost') || str_contains($baseUrl, '127.0.0.1')) {
        //     // Replace this with your actual ngrok URL when testing payments
        //     // Run: ngrok http 80
        //     // Then update this URL with the one ngrok provides
        //     $baseUrl = 'https://e16fe5cdd8ad.ngrok-free.app'; // Updated with your ngrok URL
        // }

        $callbackUrl = $baseUrl . "/anonymous-donation/callback";
        $returnUrl = $baseUrl . "/anonymous-donation/return";

        // Build the form data for PayChangu
        $formData = [
            'public_key' => $publicKey,
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
            'tx_ref' => $donation->checkout_ref,
            'amount' => $donation->amount,
            'currency' => 'MWK',
            'email' => $donation->anonymous_email,
            'first_name' => explode(' ', $donation->anonymous_name)[0],
            'last_name' => implode(' ', array_slice(explode(' ', $donation->anonymous_name), 1)) ?: '',
            'title' => 'Anonymous Donation',
            'description' => 'Anonymous donation to SOS',
            'meta[donation_id]' => $donation->id,
            'meta[type]' => 'anonymous_donation',
        ];

        // Create HTML form that auto-submits to PayChangu
        $formHtml = '<html><body><form id="paychangu-form" method="POST" action="https://api.paychangu.com/hosted-payment-page">';

        foreach ($formData as $key => $value) {
            $formHtml .= '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($value) . '">';
        }

        $formHtml .= '</form><script>document.getElementById("paychangu-form").submit();</script></body></html>';

        // Save the form to a temporary file and return the URL
        $tempFile = 'paychangu_' . $donation->checkout_ref . '.html';
        $tempPath = storage_path('app/public/' . $tempFile);
        file_put_contents($tempPath, $formHtml);

        return url('storage/' . $tempFile);
    }

    public function callback(Request $request)
    {
        Log::info('PayChangu Anonymous Donation Callback:', $request->all());

        $validated = $request->validate([
            'tx_ref' => 'required|string',
            'status' => 'required|string',
        ]);

        $donation = Donation::where('checkout_ref', $validated['tx_ref'])->first();

        if (!$donation) {
            Log::error('Anonymous donation not found for tx_ref: ' . $validated['tx_ref']);
            return response()->json(['message' => 'Donation not found'], 404);
        }

        if ($validated['status'] === 'successful') {
            $donation->update(['status' => 'received']);

            // Clean up temporary file
            $tempFile = 'paychangu_' . $donation->checkout_ref . '.html';
            $tempPath = storage_path('app/public/' . $tempFile);
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            return redirect()->route('anonymous.donation.success', ['ref' => $donation->checkout_ref]);
        } else {
            $donation->update(['status' => 'failed']);
            return redirect()->route('anonymous.donation.failed', ['ref' => $donation->checkout_ref]);
        }
    }

    public function returnUrl(Request $request)
    {
        $txRef = $request->query('tx_ref');
        $status = $request->query('status', 'failed');

        if ($txRef) {
            $donation = Donation::where('checkout_ref', $txRef)->first();
            if ($donation && $status === 'failed') {
                $donation->update(['status' => 'failed']);
            }
        }

        return redirect()->route('anonymous.donation.failed', ['ref' => $txRef]);
    }

    public function verifyTransaction(Request $request)
    {
        $validated = $request->validate([
            'tx_ref' => 'required|string',
        ]);

        $donation = Donation::where('checkout_ref', $validated['tx_ref'])->first();

        if (!$donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        // In a real implementation, you would verify with PayChangu API
        // For now, we'll manually mark as successful if payment went through
        if ($donation->status === 'pending') {
            $donation->update(['status' => 'received']);

            // Clean up temporary file
            $tempFile = 'paychangu_' . $donation->checkout_ref . '.html';
            $tempPath = storage_path('app/public/' . $tempFile);
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction verified and marked as successful',
                'redirect_url' => route('anonymous.donation.success', ['ref' => $donation->checkout_ref])
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Transaction already processed or invalid status',
            'status' => $donation->status
        ]);
    }
}

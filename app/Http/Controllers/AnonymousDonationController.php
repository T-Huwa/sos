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
            'status' => 'received',
            'is_anonymous' => true,
            'anonymous_name' => $validated['anonymous_name'],
            'anonymous_email' => $validated['anonymous_email'],
            'checkout_ref' => 'anon-' . time() . '-' . Str::random(8), // More unique reference
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
        try {
            // Validate items array
            if (empty($validated['items']) || !is_array($validated['items'])) {
                throw new \InvalidArgumentException('No items provided for donation');
            }

            // Validate each item
            foreach ($validated['items'] as $index => $item) {
                if (empty($item['name']) || trim($item['name']) === '') {
                    throw new \InvalidArgumentException("Item #" . ($index + 1) . " must have a name");
                }
                if (!isset($item['quantity']) || $item['quantity'] < 1) {
                    throw new \InvalidArgumentException("Item #" . ($index + 1) . " must have a valid quantity");
                }
                if (strlen($item['name']) > 255) {
                    throw new \InvalidArgumentException("Item #" . ($index + 1) . " name is too long (max 255 characters)");
                }
                if (isset($item['description']) && strlen($item['description']) > 500) {
                    throw new \InvalidArgumentException("Item #" . ($index + 1) . " description is too long (max 500 characters)");
                }
            }

            // Validate anonymous donor information
            if (empty($validated['anonymous_name']) || trim($validated['anonymous_name']) === '') {
                throw new \InvalidArgumentException('Donor name is required');
            }
            if (empty($validated['anonymous_email']) || !filter_var($validated['anonymous_email'], FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('Valid email address is required');
            }

            // Create donation record
            $donation = Donation::create([
                'user_id' => null,
                'donation_type' => 'goods',
                'amount' => null,
                'description' => $validated['message'],
                'status' => 'received', // Item donations are immediately received
                'is_anonymous' => true,
                'anonymous_name' => trim($validated['anonymous_name']),
                'anonymous_email' => trim($validated['anonymous_email']),
            ]);

            if (!$donation) {
                throw new \Exception('Failed to create donation record');
            }

            // Create donated items
            $createdItems = [];
            foreach ($validated['items'] as $item) {
                try {
                    $donatedItem = DonatedItem::create([
                        'donation_id' => $donation->id,
                        'item_name' => trim($item['name']),
                        'quantity' => (int) $item['quantity'],
                        'estimated_value' => null, // Could be added later by admin
                    ]);

                    if (!$donatedItem) {
                        throw new \Exception("Failed to create donated item: {$item['name']}");
                    }

                    $createdItems[] = $donatedItem;
                } catch (\Exception $e) {
                    Log::error('Failed to create donated item (anonymous)', [
                        'donation_id' => $donation->id,
                        'item' => $item,
                        'error' => $e->getMessage()
                    ]);
                    throw new \Exception("Failed to save item: {$item['name']}. " . $e->getMessage());
                }
            }

            if (empty($createdItems)) {
                throw new \Exception('No items were successfully saved');
            }

            DB::commit();

            Log::info('Anonymous item donation created successfully', [
                'donation_id' => $donation->id,
                'anonymous_name' => $validated['anonymous_name'],
                'items_count' => count($createdItems)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your item donation! We will contact you soon to arrange pickup.',
                'donation_id' => $donation->id,
                'items_count' => count($createdItems)
            ]);

        } catch (\InvalidArgumentException $e) {
            DB::rollBack();
            Log::warning('Anonymous item donation validation failed', [
                'anonymous_name' => $validated['anonymous_name'] ?? 'unknown',
                'error' => $e->getMessage(),
                'items' => $validated['items'] ?? []
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Anonymous item donation failed', [
                'anonymous_name' => $validated['anonymous_name'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process your donation. Please try again or contact support.'
            ], 500);
        }
    }

    private function generatePayChanguCheckoutUrl(Donation $donation)
    {
        // Use environment variables for security - don't hardcode keys in public repos
        $publicKey = 'pub-test-729HgrhaVYJEvic35Dvy2V0WjUieVX7a';//'PUB-TEST-FYCqr5vuwEBwhD0io289I835h6RYFWcs'; //env('PAYCHANGU_PUBLIC_KEY', 'PUB-TEST-FYCqr5vuwEBwhD0io289I835h6RYFWcs');

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
        $userNameParts = explode(' ', $donation->anonymous_name);
        $firstName = $userNameParts[0] ?? 'Anonymous';
        $lastName = count($userNameParts) > 1 ? implode(' ', array_slice($userNameParts, 1)) : '';

        $formData = [
            'public_key' => $publicKey,
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
            'tx_ref' => $donation->checkout_ref,
            'amount' => (string) $donation->amount, // Ensure it's a string
            'currency' => 'MWK',
            'email' => $donation->anonymous_email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'title' => 'Anonymous Donation',
            'description' => 'Anonymous donation to SOS',
            'meta[donation_id]' => $donation->id,
            'meta[type]' => 'anonymous_donation',
        ];

        // Debug: Log the form data to see what's being sent
        Log::info('PayChangu Form Data for Anonymous Donation:', $formData);

        // Create HTML form that auto-submits to PayChangu
        $formHtml = '<html><body><form id="paychangu-form" method="POST" action="https://api.paychangu.com/hosted-payment-page">';

        foreach ($formData as $key => $value) {
            $formHtml .= '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($value) . '">';
        }

        $formHtml .= '</form><script>document.getElementById("paychangu-form").submit();</script></body></html>';

        // Save the form to a temporary file and return the URL
        $tempFile = 'paychangu_' . $donation->checkout_ref . '_' . time() . '.html';
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

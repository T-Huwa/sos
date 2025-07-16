<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Donation;
use App\Models\DonatedItem;
use App\Models\Child;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class DonorDonationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Build query to get all donations by the authenticated user
        $query = Donation::where('user_id', $user->id)
            ->with(['child', 'items']) // Load child and donated items relationships
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('donation_type', $request->type);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhereHas('child', function ($childQuery) use ($request) {
                      $childQuery->where('name', 'like', '%' . $request->search . '%');
                  })
                  ->orWhereHas('items', function ($itemQuery) use ($request) {
                      $itemQuery->where('item_name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Get paginated donations
        $donations = $query->paginate(10);

        // Transform the data to match frontend expectations
        $donations->getCollection()->transform(function ($donation) {
            return [
                'id' => $donation->id,
                'amount' => $donation->amount,
                'donation_type' => $donation->donation_type,
                'status' => $donation->status,
                'description' => $donation->description,
                'created_at' => $donation->created_at,
                'child' => $donation->child ? [
                    'id' => $donation->child->id,
                    'name' => $donation->child->name,
                    'age' => $donation->child->age ?? null,
                ] : null,
                'donated_items' => $donation->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'estimated_value' => $item->estimated_value,
                    ];
                })->toArray(),
            ];
        });

        // Calculate comprehensive statistics
        $totalCashDonated = Donation::where('user_id', $user->id)
            ->where('status', 'received')
            ->where('donation_type', 'money')
            ->sum('amount') ?? 0;

        $totalItemsValue = Donation::where('user_id', $user->id)
            ->where('status', 'received')
            ->where('donation_type', 'goods')
            ->with('items')
            ->get()
            ->sum(function ($donation) {
                return $donation->items->sum('estimated_value') ?? 0;
            });

        $stats = [
            'total_donated' => $totalCashDonated + $totalItemsValue,
            'total_donations' => Donation::where('user_id', $user->id)->count(),
            'children_helped' => Donation::where('user_id', $user->id)
                ->whereNotNull('child_id')
                ->distinct('child_id')
                ->count(),
            'this_month' => Donation::where('user_id', $user->id)
                ->where('status', 'received')
                ->where('donation_type', 'money')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount') ?? 0,
            'general_donations' => Donation::where('user_id', $user->id)
                ->whereNull('child_id')
                ->count(),
            'child_specific_donations' => Donation::where('user_id', $user->id)
                ->whereNotNull('child_id')
                ->count(),
            'cash_donations' => Donation::where('user_id', $user->id)
                ->where('donation_type', 'money')
                ->count(),
            'item_donations' => Donation::where('user_id', $user->id)
                ->where('donation_type', 'goods')
                ->count(),
        ];

        return response()->json([
            'donations' => $donations,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'donation_type' => 'required|in:cash,items',
            'child_id' => 'nullable|exists:children,id',
            'message' => 'nullable|string|max:1000',

            // Cash donation fields
            'amount' => 'required_if:donation_type,cash|numeric|min:1',

            // Item donation fields
            'items' => 'required_if:donation_type,items|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.description' => 'nullable|string|max:500',
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
            Log::error('Donor donation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Donation failed. Please try again.'], 500);
        }
    }

    private function handleCashDonation(array $validated)
    {
        $user = Auth::user();

        // Create donation record
        $donation = Donation::create([
            'user_id' => $user->id,
            'child_id' => $validated['child_id'] ?? null,
            'donation_type' => 'money',
            'amount' => $validated['amount'],
            'description' => $validated['message'],
            'status' => 'pending',
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
        $user = Auth::user();

        // Create donation record
        $donation = Donation::create([
            'user_id' => $user->id,
            'child_id' => $validated['child_id'] ?? null,
            'donation_type' => 'goods',
            'amount' => null,
            'description' => $validated['message'],
            'status' => 'received', // Item donations are immediately received
        ]);

        // Create donated items
        foreach ($validated['items'] as $item) {
            DonatedItem::create([
                'donation_id' => $donation->id,
                'item_name' => $item['name'],
                'quantity' => $item['quantity'],
                'estimated_value' => $item['estimated_value'] ?? null, // Allow estimated value from frontend
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
        $secretKey = env('PAYCHANGU_SECRET_KEY', 'SEC-TEST-8RrdLH9CnuEnRqaoMVa7c1NiCIsrOds0');

        // Use the actual domain from APP_URL or a publicly accessible URL
        $baseUrl = config('app.url');

        // For development with PayChangu, you need a publicly accessible URL
        if (str_contains($baseUrl, 'localhost') || str_contains($baseUrl, '127.0.0.1')) {
            // Replace this with your actual ngrok URL when testing payments
            // Run: ngrok http 80
            // Then update this URL with the one ngrok provides
            $baseUrl = 'https://e16fe5cdd8ad.ngrok-free.app'; // Updated with your ngrok URL
        }

        $callbackUrl = $baseUrl . "/donor/donations/callback";
        $returnUrl = $baseUrl . "/donor/donations/return";

        // Build the payment data for PayChangu API
        $paymentData = [
            'tx_ref' => $donation->checkout_ref,
            'amount' => $donation->amount,
            'currency' => 'MWK',
            'email' => $donation->user->email,
            'first_name' => explode(' ', $donation->user->name)[0],
            'last_name' => implode(' ', array_slice(explode(' ', $donation->user->name), 1)) ?: '',
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
            'customization' => [
                'title' => 'Donation to SOS',
                'description' => $donation->child ? "Donation for {$donation->child->name}" : 'General donation to SOS',
            ],
            'meta' => [
                'donation_id' => $donation->id,
                'type' => 'donor_donation',
                'user_id' => $donation->user_id,
            ]
        ];

        // Make API call to PayChangu
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.paychangu.com/payment');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $secretKey,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return response()->json(['error' => 'Payment initialization failed'], 500);
        }

        $responseData = json_decode($response, true);

        if (!$responseData || !isset($responseData['data']['checkout_url'])) {
            return response()->json(['error' => 'Invalid payment response'], 500);
        }

        // Return the checkout URL for redirect
        return response()->json([
            'checkout_url' => $responseData['data']['checkout_url'],
            'tx_ref' => $donation->checkout_ref
        ]);


    }

    public function callback(Request $request)
    {
        Log::info('PayChangu Donor Donation Callback:', $request->all());

        $validated = $request->validate([
            'tx_ref' => 'required|string',
            'status' => 'required|string',
        ]);

        $donation = Donation::where('checkout_ref', $validated['tx_ref'])->first();

        if (!$donation) {
            Log::error('Donor donation not found for tx_ref: ' . $validated['tx_ref']);
            return response()->json(['message' => 'Donation not found'], 404);
        }

        if ($validated['status'] === 'successful') {
            $donation->update(['status' => 'received']);

            // Clean up temporary file
            $tempFile = 'paychangu_donor_' . $donation->checkout_ref . '.html';
            $tempPath = storage_path('app/public/' . $tempFile);
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            return redirect()->route('donor.donation.success', ['ref' => $donation->checkout_ref]);
        } else {
            $donation->update(['status' => 'failed']);
            return redirect()->route('donor.donation.failed', ['ref' => $donation->checkout_ref]);
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

        return redirect()->route('donor.donation.failed', ['ref' => $txRef]);
    }

    public function verifyTransaction(Request $request)
    {
        $validated = $request->validate([
            'tx_ref' => 'required|string',
        ]);

        $donation = Donation::where('checkout_ref', $validated['tx_ref'])
            ->where('user_id', Auth::id())
            ->first();

        if (!$donation) {
            return response()->json(['message' => 'Donation not found'], 404);
        }

        // In a real implementation, you would verify with PayChangu API
        // For now, we'll manually mark as successful if payment went through
        if ($donation->status === 'pending') {
            $donation->update(['status' => 'received']);

            // Clean up temporary file
            $tempFile = 'paychangu_donor_' . $donation->checkout_ref . '.html';
            $tempPath = storage_path('app/public/' . $tempFile);
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction verified and marked as successful',
                'redirect_url' => route('donor.donation.success', ['ref' => $donation->checkout_ref])
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Transaction already processed or invalid status',
            'status' => $donation->status
        ]);
    }
}

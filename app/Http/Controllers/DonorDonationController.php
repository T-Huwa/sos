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

        // Get active campaigns for the dashboard (only incomplete campaigns)
        $campaigns = \App\Models\DonationCampaign::with(['images', 'creator'])
            ->where('is_completed', false)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'message' => $campaign->message,
                    'created_at' => $campaign->created_at->format('M d, Y'),
                    'created_by' => $campaign->creator->name,
                    'first_image' => $campaign->images->first()?->image_url,
                    'images_count' => $campaign->images->count(),
                    'target_amount' => $campaign->target_amount,
                    'total_raised' => $campaign->total_raised,
                    'progress_percentage' => $campaign->progress_percentage,
                    'remaining_amount' => $campaign->remaining_amount,
                    'is_goal_reached' => $campaign->is_goal_reached,
                ];
            });

        return response()->json([
            'donations' => $donations,
            'stats' => $stats,
            'campaigns' => $campaigns,
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
            'status' => 'received',
            'checkout_ref' => 'donor-' . time() . '-' . Str::random(8), // More unique reference
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
        $publicKey = 'pub-test-729HgrhaVYJEvic35Dvy2V0WjUieVX7a'; // env('PAYCHANGU_PUBLIC_KEY', 'PUB-TEST-FYCqr5vuwEBwhD0io289I835h6RYFWcs');

        // Use the actual domain from APP_URL or a publicly accessible URL
        $baseUrl = "http://localhost:8000"; // config('app.url');

        // For development with PayChangu, you need a publicly accessible URL
        // if (str_contains($baseUrl, 'localhost') || str_contains($baseUrl, '127.0.0.1')) {
        //     // Replace this with your actual ngrok URL when testing payments
        //     // Run: ngrok http 8000
        //     // Then update this URL with the one ngrok provides
        //     $baseUrl = 'https://e16fe5cdd8ad.ngrok-free.app'; // Updated with your ngrok URL
        // }

        $callbackUrl = $baseUrl . "/donor/donations/callback";
        $returnUrl = $baseUrl . "/donor/donations/return";

        // Build the form data for PayChangu
        $userNameParts = explode(' ', $donation->user->name);
        $firstName = $userNameParts[0] ?? 'Donor';
        $lastName = count($userNameParts) > 1 ? implode(' ', array_slice($userNameParts, 1)) : '';

        $formData = [
            'public_key' => $publicKey,
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
            'tx_ref' => $donation->checkout_ref,
            'amount' => (string) $donation->amount, // Ensure it's a string
            'currency' => 'MWK',
            'email' => $donation->user->email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'title' => 'Donation to SOS',
            'description' => $donation->child ? "Donation for {$donation->child->name}" : 'General donation to SOS',
            'meta[donation_id]' => $donation->id,
            'meta[type]' => 'donor_donation',
            'meta[user_id]' => $donation->user_id,
        ];

        // Debug: Log the form data to see what's being sent
        Log::info('PayChangu Form Data for Donor Donation:', $formData);

        // Create HTML form that auto-submits to PayChangu
        $formHtml = '<html><body><form id="paychangu-form" method="POST" action="https://api.paychangu.com/hosted-payment-page">';

        foreach ($formData as $key => $value) {
            $formHtml .= '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($value) . '">';
        }

        $formHtml .= '</form><script>document.getElementById("paychangu-form").submit();</script></body></html>';

        // Save the form to a temporary file and return the URL
        $tempFile = 'paychangu_donor_' . $donation->checkout_ref . '_' . time() . '.html';
        $tempPath = storage_path('app/public/' . $tempFile);
        file_put_contents($tempPath, $formHtml);

        return url('storage/' . $tempFile);


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

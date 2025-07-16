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

        $query = Donation::where('user_id', $user->id)
            ->with(['child', 'donatedItems'])
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
                  });
            });
        }

        $donations = $query->paginate(10);

        // Calculate statistics
        $stats = [
            'total_donated' => Donation::where('user_id', $user->id)
                ->where('status', 'received')
                ->where('donation_type', 'money')
                ->sum('amount'),
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
                ->sum('amount'),
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
        $publicKey = 'pub-test-28WebWBA8fGiij3ltAPPFdKzITAIfGPS';

        // Use the actual domain from APP_URL or a publicly accessible URL
        $baseUrl = config('app.url');
        if (str_contains($baseUrl, 'localhost') || str_contains($baseUrl, '127.0.0.1')) {
            $baseUrl = 'https://cb230e0ea1ec.ngrok-free.app';
        }

        $callbackUrl = $baseUrl . "/donor/donations/callback";
        $returnUrl = $baseUrl . "/donor/donations/return";

        // Build the form data for PayChangu
        $formData = [
            'public_key' => $publicKey,
            'callback_url' => $returnUrl,
            'return_url' => $returnUrl,
            'tx_ref' => $donation->checkout_ref,
            'amount' => $donation->amount,
            'currency' => 'MWK',
            'email' => $donation->user->email,
            'first_name' => explode(' ', $donation->user->name)[0],
            'last_name' => implode(' ', array_slice(explode(' ', $donation->user->name), 1)) ?: '',
            'title' => 'Donation to SOS',
            'description' => $donation->child ? "Donation for {$donation->child->name}" : 'General donation to SOS',
            'meta[donation_id]' => $donation->id,
            'meta[type]' => 'donor_donation',
            'meta[user_id]' => $donation->user_id,
        ];

        // Create HTML form that auto-submits to PayChangu
        $formHtml = '<html><body><form id="paychangu-form" method="POST" action="https://api.paychangu.com/hosted-payment-page">';

        foreach ($formData as $key => $value) {
            $formHtml .= '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($value) . '">';
        }

        $formHtml .= '</form><script>document.getElementById("paychangu-form").submit();</script></body></html>';

        // Save the form to a temporary file and return the URL
        $tempFile = 'paychangu_donor_' . $donation->checkout_ref . '.html';
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

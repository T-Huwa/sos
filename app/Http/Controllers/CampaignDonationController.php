<?php

namespace App\Http\Controllers;

use App\Models\DonationCampaign;
use App\Models\Donation;
use App\Models\DonatedItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CampaignDonationController extends Controller
{
    public function show(DonationCampaign $campaign)
    {
        $campaign->load(['images']);

        return Inertia::render('campaigns/donate', [
            'campaign' => [
                'id' => $campaign->id,
                'message' => $campaign->message,
                'created_at' => $campaign->created_at->format('F d, Y'),
                'created_by' => $campaign->creator->name,
                'target_amount' => $campaign->target_amount,
                'total_raised' => $campaign->total_raised,
                'progress_percentage' => $campaign->progress_percentage,
                'remaining_amount' => $campaign->remaining_amount,
                'is_goal_reached' => $campaign->is_goal_reached,
                'is_completed' => $campaign->is_completed,
                'images' => $campaign->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->image_url,
                        'original_name' => $image->original_name,
                    ];
                }),
            ],
        ]);
    }

    public function store(Request $request, DonationCampaign $campaign)
    {
        $validated = $request->validate([
            'donation_type' => 'required|in:cash,items',
            'message' => 'nullable|string|max:1000',

            // Cash donation fields
            'amount' => 'required_if:donation_type,cash|numeric|min:100',

            // Item donation fields
            'items' => 'required_if:donation_type,items|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.description' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            if ($validated['donation_type'] === 'cash') {
                return $this->handleCashDonation($validated, $campaign);
            } else {
                return $this->handleItemDonation($validated, $campaign);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Campaign donation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Donation failed. Please try again.'], 500);
        }
    }

    public function storeAnonymous(Request $request, DonationCampaign $campaign)
    {
        // Log the request data for debugging
        \Log::info('Anonymous campaign donation request:', [
            'campaign_id' => $campaign->id,
            'campaign_exists' => $campaign->exists,
            'request_data' => $request->all(),
            'headers' => $request->headers->all(),
            'url' => $request->url(),
            'method' => $request->method()
        ]);

        try {
            $validated = $request->validate([
                'donation_type' => 'required|in:cash,items',
                'anonymous_name' => 'required|string|min:1|max:255',
                'anonymous_email' => 'required|email|max:255',
                'message' => 'nullable|string|max:1000',

                // Cash donation fields
                'amount' => 'required_if:donation_type,cash|numeric|min:100',

                // Item donation fields
                'items' => 'required_if:donation_type,items|array|min:1',
                'items.*.name' => 'required|string|max:255',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.description' => 'nullable|string|max:500',
            ]);

            \Log::info('Anonymous campaign donation validation passed:', $validated);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Anonymous campaign donation validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        try {
            DB::beginTransaction();

            if ($validated['donation_type'] === 'cash') {
                return $this->handleAnonymousCashDonation($validated, $campaign);
            } else {
                return $this->handleAnonymousItemDonation($validated, $campaign);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Anonymous campaign donation validation failed:', $e->errors());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Anonymous campaign donation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'campaign_id' => $campaign->id
            ]);
            return response()->json(['message' => 'Donation failed. Please try again.'], 500);
        }
    }

    private function handleCashDonation(array $validated, DonationCampaign $campaign)
    {
        $user = Auth::user();

        // Create donation record - mark as received immediately since payment gateway can't reach server
        $donation = Donation::create([
            'user_id' => $user->id,
            'campaign_id' => $campaign->id,
            'donation_type' => 'money',
            'amount' => $validated['amount'],
            'description' => $validated['message'],
            'status' => 'received', // Mark as received immediately
            'checkout_ref' => 'campaign-' . $campaign->id . '-' . time() . '-' . Str::random(8),
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

    private function handleItemDonation(array $validated, DonationCampaign $campaign)
    {
        $user = Auth::user();

        // Create donation record
        $donation = Donation::create([
            'user_id' => $user->id,
            'campaign_id' => $campaign->id,
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
            'message' => 'Item donation submitted successfully! Thank you for your generosity.',
            'donation_id' => $donation->id,
        ]);
    }

    private function handleAnonymousCashDonation(array $validated, DonationCampaign $campaign)
    {
        // Create donation record - mark as received immediately since payment gateway can't reach server
        $donation = Donation::create([
            'user_id' => null,
            'campaign_id' => $campaign->id,
            'donation_type' => 'money',
            'amount' => $validated['amount'],
            'description' => $validated['message'],
            'status' => 'received', // Mark as received immediately
            'is_anonymous' => true,
            'anonymous_name' => $validated['anonymous_name'],
            'anonymous_email' => $validated['anonymous_email'],
            'checkout_ref' => 'anon-campaign-' . $campaign->id . '-' . time() . '-' . Str::random(8),
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

    private function handleAnonymousItemDonation(array $validated, DonationCampaign $campaign)
    {
        // Create donation record
        $donation = Donation::create([
            'user_id' => null,
            'campaign_id' => $campaign->id,
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
            'message' => 'Anonymous item donation submitted successfully! Thank you for your generosity.',
            'donation_id' => $donation->id,
        ]);
    }

    private function generatePayChanguCheckoutUrl($donation)
    {
        // Use the same public key as anonymous donations
        $publicKey = 'pub-test-729HgrhaVYJEvic35Dvy2V0WjUieVX7a';

        // Use the actual domain from APP_URL or a publicly accessible URL
        $baseUrl = "http://localhost:8000";

        $callbackUrl = $baseUrl . "/campaigns/donations/callback";
        $returnUrl = $baseUrl . "/campaigns/donations/" . $donation->checkout_ref . "/success";

        // Build the form data for PayChangu
        $userNameParts = $donation->is_anonymous
            ? explode(' ', $donation->anonymous_name)
            : explode(' ', $donation->user->name);
        $firstName = $userNameParts[0] ?? 'Anonymous';
        $lastName = count($userNameParts) > 1 ? implode(' ', array_slice($userNameParts, 1)) : '';

        $formData = [
            'public_key' => $publicKey,
            'callback_url' => $callbackUrl,
            'return_url' => $returnUrl,
            'tx_ref' => $donation->checkout_ref,
            'amount' => (string) $donation->amount,
            'currency' => 'MWK',
            'email' => $donation->is_anonymous ? $donation->anonymous_email : $donation->user->email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'title' => 'Campaign Donation',
            'description' => 'Donation to campaign: ' . substr($donation->campaign->message, 0, 100),
            'meta[donation_id]' => $donation->id,
            'meta[type]' => 'campaign_donation',
            'meta[campaign_id]' => $donation->campaign_id,
        ];

        // Debug: Log the form data
        Log::info('PayChangu Form Data for Campaign Donation:', $formData);

        // Create HTML form that auto-submits to PayChangu (same as anonymous donations)
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
        Log::info('PayChangu Campaign Donation Callback:', $request->all());

        $validated = $request->validate([
            'tx_ref' => 'required|string',
            'status' => 'required|string',
        ]);

        $donation = Donation::where('checkout_ref', $validated['tx_ref'])->first();

        if (!$donation) {
            Log::error('Campaign donation not found for tx_ref: ' . $validated['tx_ref']);
            return response()->json(['status' => 'error', 'message' => 'Donation not found'], 404);
        }

        if ($validated['status'] === 'success') {
            $donation->update(['status' => 'received']);
            Log::info('Campaign donation marked as received: ' . $donation->id);
        } else {
            $donation->update(['status' => 'failed']);
            Log::info('Campaign donation marked as failed: ' . $donation->id);
        }

        return response()->json(['status' => 'success']);
    }

    public function success($ref)
    {
        $donation = Donation::where('checkout_ref', $ref)->with('campaign')->firstOrFail();

        return Inertia::render('CampaignDonationSuccess', [
            'donation' => [
                'id' => $donation->id,
                'amount' => $donation->amount,
                'donation_type' => $donation->donation_type,
                'description' => $donation->description,
                'status' => $donation->status,
                'is_anonymous' => $donation->is_anonymous,
                'anonymous_name' => $donation->anonymous_name,
                'created_at' => $donation->created_at->toISOString(),
                'campaign' => [
                    'id' => $donation->campaign->id,
                    'message' => $donation->campaign->message,
                    'created_at' => $donation->campaign->created_at->format('M d, Y'),
                    'created_by' => $donation->campaign->creator->name,
                ],
            ],
        ]);
    }
}

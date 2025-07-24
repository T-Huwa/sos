<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Donation;
use App\Models\DonationCampaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountantController extends Controller
{
    /**
     * Display the accountant dashboard
     */
    public function dashboard()
    {
        // Get total children count
        $totalChildren = Child::count();

        // Get children count from this month
        $childrenThisMonth = Child::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Get active donors (users who have made donations)
        $activeDonors = Donation::distinct('user_id')
            ->whereNotNull('user_id')
            ->count();

        // Add anonymous/guest donors
        $anonymousDonors = Donation::where(function($query) {
            $query->whereNotNull('anonymous_name')
                  ->orWhereNotNull('guest_name');
        })->count();

        $totalActiveDonors = $activeDonors + $anonymousDonors;

        // Get monthly cash donations
        $monthlyDonations = Donation::where('donation_type', 'money')
            ->where('status', 'received')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        // Get last month's donations for comparison
        $lastMonthDonations = Donation::where('donation_type', 'money')
            ->where('status', 'received')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount');

        // Calculate percentage change
        $donationChange = 0;
        if ($lastMonthDonations > 0) {
            $donationChange = (($monthlyDonations - $lastMonthDonations) / $lastMonthDonations) * 100;
        } elseif ($monthlyDonations > 0) {
            $donationChange = 100; // 100% increase if last month was 0
        }

        return Inertia::render('accountant/dashboard', [
            'dashboardData' => [
                'totalChildren' => $totalChildren,
                'childrenThisMonth' => $childrenThisMonth,
                'activeDonors' => $totalActiveDonors,
                'monthlyDonations' => $monthlyDonations,
                'donationChange' => round($donationChange, 1),
            ]
        ]);
    }

    /**
     * Display all cash donations for the accountant
     */
    public function donations()
    {
        $donations = Donation::with(['items', 'user', 'child'])
            ->where('donation_type', 'money') // Only cash donations
            ->latest()
            ->get()
            ->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'created_at' => $donation->created_at,
                    'donation_type' => $donation->donation_type,
                    'amount' => $donation->amount,
                    'status' => $donation->status,
                    'description' => $donation->description,
                    'donor_name' => $donation->user
                        ? $donation->user->name
                        : ($donation->anonymous_name ?: $donation->guest_name),
                    'donor_email' => $donation->user
                        ? $donation->user->email
                        : ($donation->anonymous_email ?: $donation->guest_email),
                    'child_name' => $donation->child
                        ? $donation->child->first_name . ' ' . $donation->child->last_name
                        : null,
                    'is_anonymous' => $donation->is_anonymous || !$donation->user,
                    'items' => $donation->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'estimated_value' => $item->estimated_value,
                            'in_inventory' => $item->in_inventory ?? false,
                        ];
                    }),
                ];
            });

        return Inertia::render('accountant/donations', [
            'donations' => $donations,
        ]);
    }

    /**
     * Display all donation campaigns for the accountant
     */
    public function campaigns()
    {
        $campaigns = DonationCampaign::with(['creator', 'images', 'donations'])
            ->latest()
            ->get()
            ->map(function ($campaign) {
                // Calculate cash donations only
                $cashDonations = $campaign->donations->where('donation_type', 'money');
                $totalCashAmount = $cashDonations->where('status', 'received')->sum('amount');
                $totalCashDonations = $cashDonations->count();

                return [
                    'id' => $campaign->id,
                    'message' => $campaign->message,
                    'created_at' => $campaign->created_at->format('M d, Y'),
                    'created_by' => $campaign->creator->name,
                    'images_count' => $campaign->images->count(),
                    'first_image' => $campaign->images->first()?->image_url,
                    'total_cash_donations' => $totalCashDonations,
                    'total_cash_amount' => $totalCashAmount,
                ];
            });

        return Inertia::render('accountant/campaigns/index', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Display a specific campaign with its cash donations
     */
    public function showCampaign(DonationCampaign $campaign)
    {
        $campaign->load(['creator', 'images', 'donations.items', 'donations.user']);

        // Calculate donation statistics for cash donations only
        $cashDonations = $campaign->donations->where('donation_type', 'money');
        $totalCashDonations = $cashDonations->count();
        $totalCashAmount = $cashDonations->where('status', 'received')->sum('amount');

        $campaignData = [
            'id' => $campaign->id,
            'message' => $campaign->message,
            'created_at' => $campaign->created_at->format('M d, Y'),
            'created_by' => $campaign->creator->name,
            'images' => $campaign->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->image_url,
                    'original_name' => $image->original_name,
                ];
            }),
            'statistics' => [
                'total_donations' => $totalCashDonations,
                'total_cash_amount' => $totalCashAmount,
                'total_item_donations' => 0, // Not relevant for accountant
                'total_items' => 0, // Not relevant for accountant
            ],
            'donations' => $cashDonations->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'donation_type' => $donation->donation_type,
                    'amount' => $donation->amount,
                    'description' => $donation->description,
                    'status' => $donation->status,
                    'is_anonymous' => $donation->is_anonymous,
                    'donor_name' => $donation->is_anonymous
                        ? $donation->anonymous_name
                        : $donation->user?->name,
                    'donor_email' => $donation->is_anonymous
                        ? $donation->anonymous_email
                        : $donation->user?->email,
                    'created_at' => $donation->created_at->format('M d, Y g:i A'),
                    'items' => [], // Cash donations don't have items
                ];
            }),
        ];

        return Inertia::render('accountant/campaigns/show', [
            'campaign' => $campaignData,
        ]);
    }

    /**
     * Display all children for the accountant
     */
    public function children()
    {
        $children = Child::with(['donations' => function ($query) {
            $query->where('donation_type', 'money'); // Only cash donations
        }])
            ->get()
            ->map(function ($child) {
                $cashDonations = $child->donations->where('donation_type', 'money');
                $totalCashReceived = $cashDonations->where('status', 'received')->sum('amount');
                $totalCashDonations = $cashDonations->count();

                return [
                    'id' => $child->id,
                    'first_name' => $child->first_name,
                    'last_name' => $child->last_name,
                    'date_of_birth' => $child->date_of_birth,
                    'gender' => $child->gender,
                    'education_level' => $child->education_level,
                    'health_status' => $child->health_status,
                    'image' => $child->image,
                    'total_cash_donations' => $totalCashDonations,
                    'total_cash_received' => $totalCashReceived,
                ];
            });

        return Inertia::render('accountant/children', [
            'children' => $children,
        ]);
    }

    /**
     * Display a specific child with their cash donations
     */
    public function showChild(Child $child)
    {
        $child->load(['donations' => function ($query) {
            $query->where('donation_type', 'money')->with('user'); // Only cash donations
        }]);

        // Get cash donations only
        $cashDonations = $child->donations->where('donation_type', 'money');

        // Get unique donors for cash donations
        $donors = $cashDonations->map(function ($donation) {
            if ($donation->user) {
                return [
                    'id' => $donation->user->id,
                    'name' => $donation->user->name,
                    'email' => $donation->user->email,
                ];
            } else {
                return [
                    'id' => 'anonymous-' . $donation->id,
                    'name' => $donation->anonymous_name ?: $donation->guest_name ?: 'Anonymous',
                    'email' => $donation->anonymous_email ?: $donation->guest_email ?: 'N/A',
                ];
            }
        })->unique('id')->values();

        return Inertia::render('accountant/child', [
            'child' => $child,
            'donations' => $cashDonations,
            'donors' => $donors,
        ]);
    }
}

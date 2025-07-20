<?php

namespace App\Http\Controllers;

use App\Models\DonationCampaign;
use App\Models\CampaignImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DonationCampaignController extends Controller
{
    public function index()
    {
        $campaigns = DonationCampaign::with(['creator', 'images'])
            ->latest()
            ->get()
            ->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'message' => $campaign->message,
                    'created_at' => $campaign->created_at->format('M d, Y'),
                    'created_by' => $campaign->creator->name,
                    'images_count' => $campaign->images->count(),
                    'first_image' => $campaign->images->first()?->image_url,
                ];
            });

        return Inertia::render('inventory/campaigns/index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create()
    {
        return Inertia::render('inventory/campaigns/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|min:10',
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $campaign = DonationCampaign::create([
            'message' => $validated['message'],
            'created_by' => Auth::id(),
        ]);

        // Handle image uploads
        foreach ($request->file('images') as $image) {
            $path = $image->store('campaigns', 'public');

            CampaignImage::create([
                'donation_campaign_id' => $campaign->id,
                'image_path' => $path,
                'original_name' => $image->getClientOriginalName(),
            ]);
        }

        return redirect()->route('inventory.campaigns.index')
            ->with('success', 'Campaign created successfully!');
    }

    public function show(DonationCampaign $campaign)
    {
        $campaign->load(['creator', 'images']);

        return Inertia::render('inventory/campaigns/show', [
            'campaign' => [
                'id' => $campaign->id,
                'message' => $campaign->message,
                'created_at' => $campaign->created_at->format('F d, Y \a\t g:i A'),
                'created_by' => $campaign->creator->name,
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
}

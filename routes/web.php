<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Models\Child;

use App\Http\Controllers\{
    DonationController,
    DonationCampaignController,
    CampaignDonationController,
    InventoryController,
    DistributionController,
    ChildController,
    SponsorshipController,
    ProgressReportController,
    ReceiptController,
    ThankYouLetterController,
    AccountantController
};

Route::get('/', function () {
    $campaigns = \App\Models\DonationCampaign::with(['images'])
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
            ];
        });

    return Inertia::render('welcome', [
        'campaigns' => $campaigns,
    ]);
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

Route::middleware(['auth'])->group(function () {
    // Dashboard or home
    Route::get('/dashboard', function () {

        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif (auth()->user()->role === 'sponsor') {
            return redirect()->route('sponsor.dashboard');
        } elseif (auth()->user()->role === 'donor') {
            return redirect()->route('donor.dashboard');
        } elseif (auth()->user()->role === 'inventory_manager') {
            return redirect()->route('inventory.dashboard');
        } elseif (auth()->user()->role === 'secretary') {
            return redirect()->route('secretary.dashboard');
        } elseif (auth()->user()->role === 'accountant') {
            return redirect()->route('accountant.dashboard');
        }
        //return Inertia::render('dashboard');
    })->name('dashboard');

    // Donations
    // Route::resource('donations', DonationController::class)->only([
    //     'index', 'create', 'store', 'show'
    // ]);

    // Inventory
    // Route::resource('inventory', InventoryController::class)->only([
    //     'index', 'create', 'store', 'show'
    // ]);

    // Distributions
    Route::resource('distributions', DistributionController::class)->only([
        'index', 'create', 'store', 'show'
    ]);

    // Children
    Route::resource('children', ChildController::class)->only([
        'index', 'create', 'store', 'show'
    ]);

    // Sponsorships
    Route::resource('sponsorships', SponsorshipController::class)->only([
        'index', 'create', 'store', 'show'
    ]);

    // Progress Reports
    Route::resource('progress-reports', ProgressReportController::class)->only([
        'index', 'create', 'store', 'show'
    ]);

    // Receipts
    Route::resource('receipts', ReceiptController::class)->only([
        'index', 'show'
    ]);

    // Thank You Letters
    Route::resource('thank-you-letters', ThankYouLetterController::class)->only([
        'index', 'show'
    ]);
});

Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('admin/dashboard'))->name('admin.dashboard');
});

// Secretary routes
Route::middleware(['auth'])->prefix('secretary')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('secretary/dashboard'))->name('secretary.dashboard');

    // Children management routes
    Route::get('/children', fn () => Inertia::render('secretary/children', [
        'children' => Child::all()
    ]))->name('secretary.children');

    Route::get('/children/{id}', [ChildController::class, 'showSec'])->name('secretary.children.show');
    //Route::get('/children/{id}', [ChildController::class, 'show'])->name('secretary.children.show');
    Route::post('/children', [ChildController::class, 'store'])->name('secretary.children.store');
});

Route::middleware(['auth'])->prefix('sponsor')->group(function () {
    Route::get('/dashboard', function () {
        $campaigns = \App\Models\DonationCampaign::with(['images'])
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
                ];
            });

        return Inertia::render('sponsor/dashboard', [
            'campaigns' => $campaigns,
        ]);
    })->name('sponsor.dashboard');
    Route::get('/children', [App\Http\Controllers\SponsorController::class, 'browseChildren'])->name('sponsor.children');
    Route::get('/children/{id}', [App\Http\Controllers\SponsorController::class, 'showChild'])->name('sponsor.child');
    Route::post('/children/{id}/sponsor', [App\Http\Controllers\SponsorController::class, 'sponsorChild'])->name('sponsor.sponsor-child');
    Route::get('/my-sponsorships', [App\Http\Controllers\SponsorController::class, 'mySponsorship'])->name('sponsor.my-sponsorships');
});

Route::middleware(['auth'])->prefix('donor')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('donor/dashboard'))->name('donor.dashboard');
    Route::get('/donations', fn () => Inertia::render('donor/donations'))->name('donor.donations');
    Route::get('/children', [ChildController::class, 'indexForDonors'])->name('donor.children');
    Route::get('/donate', fn () => Inertia::render('donor/donate'))->name('donor.donate');
    Route::get('/history', fn () => Inertia::render('donor/history'))->name('donor.history');

    Route::get('/children/{id}', [ChildController::class, 'showToDonor'])->name('donor.child');

    // Donor donation API routes
    Route::get('/donations/api', [App\Http\Controllers\DonorDonationController::class, 'index'])->name('donor.donations.api');
    Route::post('/donations', [App\Http\Controllers\DonorDonationController::class, 'store'])->name('donor.donations.store');
    Route::post('/donations/callback', [App\Http\Controllers\DonorDonationController::class, 'callback'])->name('donor.donations.callback');
    Route::get('/donations/return', [App\Http\Controllers\DonorDonationController::class, 'returnUrl'])->name('donor.donations.return');
    Route::post('/donations/verify', [App\Http\Controllers\DonorDonationController::class, 'verifyTransaction'])->name('donor.donations.verify');

    // Donor donation success/failure pages
    Route::get('/donations/success/{ref}', function ($ref) {
        $donation = \App\Models\Donation::where('checkout_ref', $ref)
            ->where('user_id', auth()->id())
            ->with(['child', 'donatedItems'])
            ->firstOrFail();
        return Inertia::render('donor/DonationSuccess', ['donation' => $donation]);
    })->name('donor.donation.success');

    Route::get('/donations/failed/{ref?}', function ($ref = null) {
        $donation = null;
        if ($ref) {
            $donation = \App\Models\Donation::where('checkout_ref', $ref)
                ->where('user_id', auth()->id())
                ->with(['child', 'donatedItems'])
                ->first();
        }
        return Inertia::render('donor/DonationFailed', ['donation' => $donation]);
    })->name('donor.donation.failed');

    Route::get('/donations/verify', function () {
        return Inertia::render('donor/DonationVerify');
    })->name('donor.donation.verify.page');
});

// Inventory manager routes
Route::middleware(['auth'])->prefix('inventory')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('inventory/dashboard'))->name('inventory.dashboard');
    
    // children routes
    Route::get('/children', fn () => Inertia::render('inventory/children', [
        'children' => Child::all()
    ]))->name('inventory.children');

    Route::get('/children/{id}', [ChildController::class, 'showEditable'])->name('inventory.children.show');
    Route::put('/children/{id}', [ChildController::class, 'update'])->name('inventory.children.update');
    Route::delete('/children/{id}', [ChildController::class, 'destroy'])->name('inventory.children.destroy');

    
    Route::get('/communications', fn () => Inertia::render('inventory/communications'))->name('inventory.communications');
    Route::get('/donations', [ChildController::class, 'getDonations'])->name('inventory.donations');
    Route::post('/donations/{donation}/add-to-inventory', [ChildController::class, 'addDonationToInventory'])->name('inventory.donations.add-to-inventory');
    Route::get('/inventory', [ChildController::class, 'getInventory'])->name('inventory.inventory');
    Route::get('/reports', fn () => Inertia::render('inventory/reports'))->name('inventory.reports');

    // Campaign routes
    Route::get('/campaigns', [DonationCampaignController::class, 'index'])->name('inventory.campaigns.index');
    Route::get('/campaigns/create', [DonationCampaignController::class, 'create'])->name('inventory.campaigns.create');
    Route::post('/campaigns', [DonationCampaignController::class, 'store'])->name('inventory.campaigns.store');
    Route::get('/campaigns/{campaign}', [DonationCampaignController::class, 'show'])->name('inventory.campaigns.show');
});

// Accountant routes
Route::middleware(['auth'])->prefix('accountant')->group(function () {
    Route::get('/dashboard', [AccountantController::class, 'dashboard'])->name('accountant.dashboard');

    // Cash donations routes
    Route::get('/donations', [AccountantController::class, 'donations'])->name('accountant.donations');

    // Campaign routes (view only)
    Route::get('/campaigns', [AccountantController::class, 'campaigns'])->name('accountant.campaigns');
    Route::get('/campaigns/{campaign}', [AccountantController::class, 'showCampaign'])->name('accountant.campaigns.show');

    // Children routes (view only)
    Route::get('/children', [AccountantController::class, 'children'])->name('accountant.children');
    Route::get('/children/{child}', [AccountantController::class, 'showChild'])->name('accountant.children.show');
});

Route::get('/donations/{ref}/success', function ($ref) {
    $donation = \App\Models\Donation::where('checkout_ref', $ref)->firstOrFail();
    return Inertia::render('DonationSuccess', ['donation' => $donation]);
});


Route::get('/children', [ChildController::class, 'index'])->name('children');
Route::get('/children/{id}', [ChildController::class, 'show'])->name('children.show');
Route::post('/children', [ChildController::class, 'store'])->name('children.store');

Route::post('/donations', [DonationController::class, 'store']);
Route::post('/donations/webhook', [DonationController::class, 'handleWebhook']);

// Campaign donation routes (public)
Route::get('/campaigns/{campaign}/donate', [CampaignDonationController::class, 'show'])->name('campaigns.donate');
Route::post('/campaigns/{campaign}/donate/anonymous', [CampaignDonationController::class, 'storeAnonymous'])->name('campaigns.donate.anonymous');

// Authenticated campaign donation route
Route::get('/campaigns/{campaign}/donate-authenticated', function (\App\Models\DonationCampaign $campaign) {
    $campaign->load(['creator', 'images']);

    return Inertia::render('campaigns/donate-authenticated', [
        'campaign' => [
            'id' => $campaign->id,
            'message' => $campaign->message,
            'created_at' => $campaign->created_at->format('F d, Y'),
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
})->middleware('auth')->name('campaigns.donate.authenticated');

// Campaign donation routes (authenticated)
Route::middleware(['auth'])->group(function () {
    Route::post('/campaigns/{campaign}/donate', [CampaignDonationController::class, 'store'])->name('campaigns.donate.store');
});

// Campaign donation success/callback routes
Route::get('/campaigns/donations/{ref}/success', [CampaignDonationController::class, 'success'])->name('campaign.donation.success');
Route::post('/campaigns/donations/callback', [CampaignDonationController::class, 'callback'])->name('campaign.donation.callback');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/static.php';

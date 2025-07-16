<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Models\Child;

use App\Http\Controllers\{
    DonationController,
    InventoryController,
    DistributionController,
    ChildController,
    SponsorshipController,
    ProgressReportController,
    ReceiptController,
    ThankYouLetterController
};

Route::get('/', function () {
    return Inertia::render('welcome');
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
        }
        return Inertia::render('dashboard');
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

Route::middleware(['auth'])->prefix('sponsor')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('sponsor/dashboard'))->name('sponsor.dashboard');
});

Route::middleware(['auth'])->prefix('donor')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('donor/dashboard'))->name('donor.dashboard');
    Route::get('/donations', fn () => Inertia::render('donor/donations'))->name('donor.donations');
    Route::get('/children', fn () => Inertia::render('donor/children'))->name('donor.children');
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
    Route::get('/inventory', fn () => Inertia::render('inventory/inventory'))->name('inventory.inventory');
    Route::get('/reports', fn () => Inertia::render('inventory/reports'))->name('inventory.reports');
});

Route::get('/donations/{ref}/success', function ($ref) {
    $donation = \App\Models\Donation::where('checkout_ref', $ref)->firstOrFail();
    return Inertia::render('DonationSuccess', ['donation' => $donation]);
});


Route::get('/children', [ChildController::class, 'index'])->name('children');
Route::get('/children/{id}', [ChildController::class, 'show'])->name('children.show');
Route::post('/children', [ChildController::class, 'store'])->name('children.store');

Route::post('/donations', [DonationController::class, 'store']);
Route::get('/children', [ChildController::class, 'index']);
Route::post('/donations/webhook', [DonationController::class, 'handleWebhook']); 

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/static.php';

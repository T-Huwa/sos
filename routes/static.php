<?php 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\AnonymousDonationController;
use App\Http\Controllers\Admin\UserController;

Route::get('/anonymous-donation', function () {
    return Inertia::render('AnonymousDonation');
})->name('anonymous.donation');

Route::get('/anonymous-donation/verify', function () {
    return Inertia::render('AnonymousDonationVerify');
})->name('anonymous.donation.verify.page');

Route::post('/anonymous-donation', [AnonymousDonationController::class, 'store'])->name('anonymous.donation.store');
Route::post('/anonymous-donation/callback', [AnonymousDonationController::class, 'callback'])->name('anonymous.donation.callback');
Route::get('/anonymous-donation/return', [AnonymousDonationController::class, 'returnUrl'])->name('anonymous.donation.return');
Route::post('/anonymous-donation/verify', [AnonymousDonationController::class, 'verifyTransaction'])->name('anonymous.donation.verify');

Route::get('/anonymous-donation/success/{ref}', function ($ref) {
    $donation = \App\Models\Donation::where('checkout_ref', $ref)->firstOrFail();
    return Inertia::render('AnonymousDonationSuccess', ['donation' => $donation]);
})->name('anonymous.donation.success');

Route::get('/anonymous-donation/failed/{ref?}', function ($ref = null) {
    $donation = null;
    if ($ref) {
        $donation = \App\Models\Donation::where('checkout_ref', $ref)->first();
    }
    return Inertia::render('AnonymousDonationFailed', ['donation' => $donation]);
})->name('anonymous.donation.failed');

Route::prefix('admin/users')->name('admin.users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::post('/{user}/activate', [UserController::class, 'activate'])->name('activate');
    Route::post('/{user}/deactivate', [UserController::class, 'deactivate'])->name('deactivate');
});

//Route::post('/anonymous-donation', [AnonymousDonationController::class, 'store'])->name('anonymous.donation.store');

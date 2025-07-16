<?php 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\AnonymousDonationController;
use App\Http\Controllers\Admin\UserController;

Route::get('/anonymous-donation', function () {
    return Inertia::render('AnonymousDonation');
})->name('anonymous.donation');

Route::post('/anonymous-donation', [AnonymousDonationController::class, 'store'])->name('anonymous.donation.store');

Route::prefix('admin/users')->name('admin.users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::post('/{user}/activate', [UserController::class, 'activate'])->name('activate');
    Route::post('/{user}/deactivate', [UserController::class, 'deactivate'])->name('deactivate');
});

//Route::post('/anonymous-donation', [AnonymousDonationController::class, 'store'])->name('anonymous.donation.store');

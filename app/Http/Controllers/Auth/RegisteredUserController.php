<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => 'required|string|max:20',
            'role' => 'required|in:admin,donor,sponsor,inventory_manager,secretary',
            'sponsor_type' => 'nullable|in:individual,organization',
            'organization_name' => 'nullable|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'sponsor_type' => $request->role === 'sponsor' ? $request->sponsor_type : null,
            'organization_name' => ($request->role === 'sponsor' && $request->sponsor_type === 'organization')
                ? $request->organization_name
                : null,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended($this->redirectToRoleDashboard($user));
    }

    protected function redirectToRoleDashboard(User $user): string
    {
        return match ($user->role) {
            'admin' => route('admin.dashboard'),
            'sponsor' => route('sponsor.dashboard'),
            'donor' => route('donor.dashboard'),
            'inventory_manager' => route('inventory.dashboard'),
            'secretary' => route('secretary.dashboard'),
            default => route('dashboard'),
        };
    }

}

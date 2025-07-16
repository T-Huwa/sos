<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{

    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'is_approved', 'created_at')->get();
        return Inertia::render('admin/users', ['users' => $users]);
    }

    public function deactivate(User $user)
    {
        $user->update(['is_approved' => 0]);
        return back();
    }

    public function activate(User $user)
    {
        $user->update(['is_approved' => true]);
        return back();
    }

    public function create()
    {
        return Inertia::render('admin/userCreate');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => 'required|string|max:100',
            'password' => 'required|string|min:6',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return redirect()->route('admin.users.index');
    }
}

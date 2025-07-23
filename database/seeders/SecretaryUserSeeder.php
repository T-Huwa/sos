<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;

class SecretaryUserSeeder extends Seeder
{
    public function run(): void
    {

        // Secretary
        /*User::firstOrCreate([
            'name' => 'Secretary User',
            'email' => 'secretary@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('test1234'),
            'phone' => '555-987-6543',
            'role' => 'secretary',
            'profile_photo' => null,
            'sponsor_type' => null,
            'organization_name' => null,
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Accountant "User
        User::firstOrCreate([
            'name' => 'Accountant User',
            'email' => 'accountant@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('test1234'),
            'phone' => '555-987-6543',
            'role' => 'accountant',
            'profile_photo' => null,
            'sponsor_type' => null,
            'organization_name' => null,
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);*/

        // Inventory manager
        User::firstOrCreate([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('test1234'),
            'phone' => '555-987-6543',
            'role' => 'inventory_manager',
            'profile_photo' => null,
            'sponsor_type' => null,
            'organization_name' => null,
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

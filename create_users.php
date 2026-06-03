<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$tenant = Tenant::first();
if ($tenant) {
    tenancy()->initialize($tenant);
}

$admin = User::firstOrCreate(
    ['email' => 'admin@example.com'],
    [
        'name' => 'Admin User',
        'first_name' => 'Admin',
        'last_name' => 'User',
        'password' => Hash::make('password123'),
        'role' => 'admin',
        'status' => 'active'
    ]
);

$user = User::firstOrCreate(
    ['email' => 'user@example.com'],
    [
        'name' => 'John Doe',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'password' => Hash::make('password123'),
        'role' => 'user',
        'status' => 'active'
    ]
);

echo "Admin account: admin@example.com / password123\n";
echo "User account: user@example.com / password123\n";

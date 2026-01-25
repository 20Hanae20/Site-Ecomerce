<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        User::updateOrCreate(
            ['email' => 'admin@siteparfum.fr'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'role' => User::ROLE_SUPER_ADMIN,
                'status' => User::STATUS_ACTIVE
            ]
        );

        // Create Regular Admin
        User::updateOrCreate(
            ['email' => 'moderateur@siteparfum.fr'],
            [
                'name' => 'Moderateur Demo',
                'password' => Hash::make('pass123'),
                'role' => User::ROLE_MODERATOR,
                'status' => User::STATUS_ACTIVE
            ]
        );

        // Create Demo User
        User::updateOrCreate(
            ['email' => 'user@siteparfum.fr'],
            [
                'name' => 'Client Demo',
                'password' => Hash::make('user123'),
                'role' => User::ROLE_USER,
                'status' => User::STATUS_ACTIVE
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'super_admin',
            'tenant_admin',
            'manager',
            'moderator',
            'user',
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }

        // Assign super_admin to any existing users with role 'super_admin' (legacy column)
        $admins = User::where('role', 'super_admin')->get();
        foreach ($admins as $admin) {
            $admin->assignRole('super_admin');
        }
    }
}

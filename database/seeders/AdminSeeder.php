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

        // Seed some AdminLoginLogs and ActionLogs
        $superAdmin = User::where('email', 'admin@siteparfum.fr')->first();
        $moderator = User::where('email', 'moderateur@siteparfum.fr')->first();

        if ($superAdmin && $moderator) {
            $ips = ['192.168.1.50', '82.120.45.18', '104.244.72.10', '198.51.100.4'];
            $uas = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1'
            ];

            // Clean existing logs safely
            \App\Models\AdminLoginLog::query()->delete();
            \App\Models\ActionLog::query()->delete();

            // Seed 10 login logs
            for ($i = 0; $i < 10; $i++) {
                \App\Models\AdminLoginLog::create([
                    'user_id' => $i % 2 === 0 ? $superAdmin->id : $moderator->id,
                    'ip_address' => $ips[array_rand($ips)],
                    'user_agent' => $uas[array_rand($uas)],
                    'status' => $i === 3 || $i === 7 ? 'failed' : 'success',
                    'logged_at' => now()->subHours($i * 4)->subMinutes(rand(1, 59))
                ]);
            }

            // Seed 8 admin action logs
            $actions = [
                ['action' => 'CREATE', 'target_type' => 'Perfume', 'details' => ['name' => 'Royal Amber']],
                ['action' => 'UPDATE', 'target_type' => 'Tenant', 'details' => ['status' => 'suspended']],
                ['action' => 'UPDATE', 'target_type' => 'Setting', 'details' => ['maintenance_mode' => true]],
                ['action' => 'DELETE', 'target_type' => 'Review', 'details' => ['review_id' => 14]],
                ['action' => 'CREATE', 'target_type' => 'Promotion', 'details' => ['code' => 'GOLDEN2026']],
                ['action' => 'UPDATE', 'target_type' => 'Category', 'details' => ['name' => 'Boisés & Épicés']],
                ['action' => 'UPDATE', 'target_type' => 'User', 'details' => ['role' => 'gestionnaire']],
                ['action' => 'CREATE', 'target_type' => 'Perfume', 'details' => ['name' => 'Santal Mystique']]
            ];

            foreach ($actions as $idx => $act) {
                \App\Models\ActionLog::create([
                    'user_id' => $idx % 3 === 0 ? $moderator->id : $superAdmin->id,
                    'action' => $act['action'],
                    'target_type' => $act['target_type'],
                    'target_id' => rand(1, 100),
                    'details' => $act['details'],
                    'ip_address' => $ips[array_rand($ips)],
                    'created_at' => now()->subHours($idx * 5)->subMinutes(rand(1, 59)),
                    'updated_at' => now()->subHours($idx * 5)->subMinutes(rand(1, 59))
                ]);
            }
        }
    }
}

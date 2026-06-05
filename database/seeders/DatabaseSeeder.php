<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            TenantSeeder::class,
        ]);

        $tenant = \App\Models\Tenant::first();
        if ($tenant) {
            tenancy()->initialize($tenant);
        }

        $this->call([
            AdminSeeder::class,
            UsersDemoSeeder::class,
            CategorySeeder::class,
            PerfumeSeeder::class,
            ReviewSeeder::class,
            PromotionSeeder::class,
            SettingSeeder::class,
            MLTestDataSeeder::class,
        ]);
    }
}

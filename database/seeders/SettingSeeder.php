<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'Site Parfum', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'contact@siteparfum.fr', 'group' => 'general'],
            ['key' => 'currency', 'value' => 'EUR', 'group' => 'general'],
            ['key' => 'shipping_fee', 'value' => '5.00', 'group' => 'general'],
            ['key' => 'maintenance_mode', 'value' => '0', 'group' => 'system'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}

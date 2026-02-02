<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $promotions = [
            [
                'name' => 'Collection de Printemps',
                'code' => 'PRINTEMPS2024',
                'type' => 'percentage',
                'value' => 15.00,
                'start_date' => '2024-03-01 00:00:00',
                'end_date' => '2024-05-31 23:59:59',
                'is_active' => true,
            ],
            [
                'name' => 'Offre de Bienvenue',
                'code' => 'BIENVENUE10',
                'type' => 'fixed',
                'value' => 10.00,
                'start_date' => now(),
                'end_date' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Privilège VIP',
                'code' => 'ELITE25',
                'type' => 'percentage',
                'value' => 25.00,
                'start_date' => now(),
                'end_date' => now()->addMonths(1),
                'is_active' => true,
            ],
            [
                'name' => 'Soldes d\'Hiver',
                'code' => 'HIVER2024',
                'type' => 'percentage',
                'value' => 30.00,
                'start_date' => '2024-01-01 00:00:00',
                'end_date' => '2024-02-15 23:59:59',
                'is_active' => false,
            ],
        ];

        foreach ($promotions as $promo) {
            \App\Models\Promotion::updateOrCreate(
                ['code' => $promo['code']],
                $promo
            );
        }
    }
}

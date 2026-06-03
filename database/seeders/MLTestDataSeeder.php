<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Perfume;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MLTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $tenant = Tenant::first();
        $tenantId = $tenant ? $tenant->id : null;

        if (!$tenantId) {
            $this->command->warn('No tenant found. Please run TenantSeeder first.');
            return;
        }

        // Get some random perfumes to buy
        $perfumes = Perfume::where('tenant_id', $tenantId)->inRandomOrder()->take(10)->get();

        if ($perfumes->isEmpty()) {
            $this->command->warn('No perfumes found. Please run PerfumeSeeder first.');
            return;
        }

        // 1. Profil Fidèle : Achète régulièrement (chaque mois ou deux)
        $loyalUser = User::firstOrCreate([
            'email' => 'loyal@mltest.com'
        ], [
            'tenant_id' => $tenantId,
            'name' => 'Client Fidèle',
            'first_name' => 'Client',
            'last_name' => 'Fidèle',
            'password' => Hash::make('password'),
            'role' => 'client',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 2. Profil Saisonnier : Achète seulement pendant les fêtes (Novembre/Décembre, Février)
        $seasonalUser = User::firstOrCreate([
            'email' => 'seasonal@mltest.com'
        ], [
            'tenant_id' => $tenantId,
            'name' => 'Client Saisonnier',
            'first_name' => 'Client',
            'last_name' => 'Saisonnier',
            'password' => Hash::make('password'),
            'role' => 'client',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 3. Profil Churner : A beaucoup acheté il y a 8-12 mois, puis plus rien
        $churnerUser = User::firstOrCreate([
            'email' => 'churner@mltest.com'
        ], [
            'tenant_id' => $tenantId,
            'name' => 'Client Perdu',
            'first_name' => 'Client',
            'last_name' => 'Perdu',
            'password' => Hash::make('password'),
            'role' => 'client',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->generateLoyalHistory($loyalUser, $perfumes, $tenantId);
        $this->generateSeasonalHistory($seasonalUser, $perfumes, $tenantId);
        $this->generateChurnerHistory($churnerUser, $perfumes, $tenantId);

        $this->command->info('ML Test Data Seeded successfully!');
    }

    private function generateLoyalHistory($user, $perfumes, $tenantId)
    {
        // 8 commandes réparties sur les 12 derniers mois
        for ($i = 0; $i < 8; $i++) {
            $date = Carbon::now()->subDays(rand(1, 365));
            $this->createOrder($user, $perfumes->random(rand(1, 3)), $date, $tenantId);
        }
    }

    private function generateSeasonalHistory($user, $perfumes, $tenantId)
    {
        // Achats vers Noël (Décembre)
        $this->createOrder($user, $perfumes->random(2), Carbon::now()->subMonths(6)->setMonth(12)->setDay(rand(1, 20)), $tenantId);
        // Achats vers Saint Valentin (Février)
        $this->createOrder($user, $perfumes->random(1), Carbon::now()->subMonths(4)->setMonth(2)->setDay(rand(1, 13)), $tenantId);
    }

    private function generateChurnerHistory($user, $perfumes, $tenantId)
    {
        // 4 achats concentrés entre 9 et 12 mois dans le passé
        for ($i = 0; $i < 4; $i++) {
            $date = Carbon::now()->subDays(rand(270, 360));
            $this->createOrder($user, $perfumes->random(rand(1, 2)), $date, $tenantId);
        }
    }

    private function createOrder($user, $selectedPerfumes, $date, $tenantId)
    {
        $order = Order::create([
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'status' => 'delivered',
            'subtotal' => 0,
            'tax' => 0,
            'shipping_cost' => 5.00,
            'total' => 0,
            'payment_method' => 'card', // usually credit_card or stripe
            'payment_status' => 'completed',
            'shipping_address_id' => null, // Optionnel pour le test
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $subtotal = 0;

        foreach ($selectedPerfumes as $perfume) {
            $quantity = rand(1, 2);
            $itemSubtotal = $perfume->price * $quantity;
            $subtotal += $itemSubtotal;

            OrderItem::create([
                'tenant_id' => $tenantId,
                'order_id' => $order->id,
                'perfume_id' => $perfume->id,
                'perfume_name' => $perfume->name,
                'perfume_price' => $perfume->price,
                'quantity' => $quantity,
                'subtotal' => $itemSubtotal,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }

        $tax = $subtotal * 0.20; // 20% TVA
        
        $order->update([
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $subtotal + $tax + 5.00,
        ]);
    }
}

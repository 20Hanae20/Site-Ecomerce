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
            'role' => 'user',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 2. Profil Saisonnier : Achète seulement pendant les fêtes
        $seasonalUser = User::firstOrCreate([
            'email' => 'seasonal@mltest.com'
        ], [
            'tenant_id' => $tenantId,
            'name' => 'Client Saisonnier',
            'first_name' => 'Client',
            'last_name' => 'Saisonnier',
            'password' => Hash::make('password'),
            'role' => 'user',
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
            'role' => 'user',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->generateLoyalHistory($loyalUser, $perfumes, $tenantId);
        $this->generateSeasonalHistory($seasonalUser, $perfumes, $tenantId);
        $this->generateChurnerHistory($churnerUser, $perfumes, $tenantId);

        // 4. Generate 5 VIP Clients (> 5 orders or > 500 € total spent)
        for ($i = 1; $i <= 5; $i++) {
            $user = User::firstOrCreate([
                'email' => "vip{$i}@mltest.com"
            ], [
                'tenant_id' => $tenantId,
                'name' => "VIP Client {$i}",
                'first_name' => 'VIP',
                'last_name' => "Client {$i}",
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            // Seed 6 to 10 orders spread over the last 12 months
            $numOrders = rand(6, 10);
            for ($o = 0; $o < $numOrders; $o++) {
                $date = Carbon::now()->subDays(rand(5, 360));
                // High price perfumes to reach >500€ easily
                $this->createOrder($user, $perfumes->random(rand(2, 3)), $date, $tenantId, true);
            }
        }

        // 5. Generate 8 Premium Clients (3 to 5 orders or > 200 € total spent)
        for ($i = 1; $i <= 8; $i++) {
            $user = User::firstOrCreate([
                'email' => "premium{$i}@mltest.com"
            ], [
                'tenant_id' => $tenantId,
                'name' => "Premium Client {$i}",
                'first_name' => 'Premium',
                'last_name' => "Client {$i}",
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $numOrders = rand(3, 4);
            for ($o = 0; $o < $numOrders; $o++) {
                $date = Carbon::now()->subDays(rand(5, 360));
                $this->createOrder($user, $perfumes->random(rand(1, 2)), $date, $tenantId, false);
            }
        }

        // 6. Generate 12 Occasional Clients (1 to 2 orders)
        for ($i = 1; $i <= 12; $i++) {
            $user = User::firstOrCreate([
                'email' => "occasional{$i}@mltest.com"
            ], [
                'tenant_id' => $tenantId,
                'name' => "Occasional Client {$i}",
                'first_name' => 'Occasional',
                'last_name' => "Client {$i}",
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $numOrders = rand(1, 2);
            for ($o = 0; $o < $numOrders; $o++) {
                $date = Carbon::now()->subDays(rand(10, 360));
                $this->createOrder($user, $perfumes->random(1), $date, $tenantId, false);
            }
        }

        // 7. Generate 10 New Clients (0 orders)
        for ($i = 1; $i <= 10; $i++) {
            User::firstOrCreate([
                'email' => "newclient{$i}@mltest.com"
            ], [
                'tenant_id' => $tenantId,
                'name' => "New Client {$i}",
                'first_name' => 'New',
                'last_name' => "Client {$i}",
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }

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

    private function createOrder($user, $selectedPerfumes, $date, $tenantId, $isHighValue = false)
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
            'payment_method' => 'card',
            'payment_status' => 'completed',
            'shipping_address_id' => null,
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        $subtotal = 0;

        foreach ($selectedPerfumes as $perfume) {
            $quantity = $isHighValue ? rand(2, 3) : rand(1, 2);
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

<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Perfume;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run basic metadata & tenants setup
        $this->call([
            RoleSeeder::class,
            TenantSeeder::class,
        ]);

        $tenants = Tenant::all();

        // 2. Loop through each tenant, initialize scope, and seed database rows
        foreach ($tenants as $tenant) {
            $name = $tenant->data['name'] ?? 'Unknown';
            $this->command->info("Seeding data for tenant: {$tenant->id} ({$name})");
            tenancy()->initialize($tenant);

            if ($name === 'Maison de Parfum Demo') {
                // Main demo tenant gets the full dataset (reviews, promotions, settings, etc.)
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
            } else if ($name !== 'Aura Fragrances') {
                // Seed some categories and perfumes for other active tenants
                $this->call([
                    CategorySeeder::class,
                    PerfumeSeeder::class,
                ]);

                // Create a list of 6-12 clients for this tenant
                $usersCount = rand(6, 12);
                $users = [];
                for ($i = 1; $i <= $usersCount; $i++) {
                    $users[] = User::create([
                        'name' => "Client {$name} {$i}",
                        'first_name' => 'Client',
                        'last_name' => "Tenant{$tenant->id} {$i}",
                        'email' => "client{$i}@tenant{$tenant->id}.com",
                        'password' => Hash::make('client123'),
                        'role' => 'user',
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]);
                }

                // Create 15-30 random orders spread out across the last 6 months
                $perfumes = Perfume::all();
                if ($perfumes->isNotEmpty()) {
                    $ordersCount = rand(15, 30);
                    for ($j = 1; $j <= $ordersCount; $j++) {
                        $user = $users[array_rand($users)];
                        $date = now()->subDays(rand(1, 180));
                        
                        $order = Order::create([
                            'tenant_id' => $tenant->id,
                            'user_id' => $user->id,
                            'order_number' => 'ORD-' . strtoupper(uniqid()),
                            'status' => 'delivered',
                            'subtotal' => 0,
                            'tax' => 0,
                            'shipping_cost' => 5.00,
                            'total' => 0,
                            'payment_method' => 'card',
                            'payment_status' => 'completed',
                            'created_at' => $date,
                            'updated_at' => $date,
                        ]);

                        $subtotal = 0;
                        $selected = $perfumes->random(rand(1, 3));
                        foreach ($selected as $p) {
                            $qty = rand(1, 2);
                            $itemSub = $p->price * $qty;
                            $subtotal += $itemSub;

                            OrderItem::create([
                                'tenant_id' => $tenant->id,
                                'order_id' => $order->id,
                                'perfume_id' => $p->id,
                                'perfume_name' => $p->name,
                                'perfume_price' => $p->price,
                                'quantity' => $qty,
                                'subtotal' => $itemSub,
                                'created_at' => $date,
                                'updated_at' => $date,
                            ]);
                        }

                        $tax = $subtotal * 0.20; // 20% VAT
                        $order->update([
                            'subtotal' => $subtotal,
                            'tax' => $tax,
                            'total' => $subtotal + $tax + 5.00,
                        ]);
                    }
                }
            }
        }

        // Leave demo tenant as active context at finalization
        $demo = Tenant::all()->first();
        if ($demo) {
            tenancy()->initialize($demo);
        }
    }
}

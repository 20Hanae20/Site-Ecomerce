<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Stancl\Tenancy\Database\Models\Domain;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenantsData = [
            [
                'id' => 1,
                'name' => 'Maison de Parfum Demo',
                'domain' => 'demo.localhost',
                'plan' => 'starter',
                'status' => 'active',
                'is_active' => true,
                'email' => 'demo@maisonparfum.com'
            ],
            [
                'id' => 2,
                'name' => "L'Essence de Paris",
                'domain' => 'essence.localhost',
                'plan' => 'business',
                'status' => 'active',
                'is_active' => true,
                'email' => 'contact@essence.fr'
            ],
            [
                'id' => 3,
                'name' => 'Royal Fragrances',
                'domain' => 'royal.localhost',
                'plan' => 'enterprise',
                'status' => 'active',
                'is_active' => true,
                'email' => 'info@royalfragrance.co.uk'
            ],
            [
                'id' => 4,
                'name' => 'Scent & Co',
                'domain' => 'scent.localhost',
                'plan' => 'starter',
                'status' => 'active',
                'is_active' => true,
                'email' => 'hello@scentco.com'
            ],
            [
                'id' => 5,
                'name' => 'Aura Fragrances',
                'domain' => 'aura.localhost',
                'plan' => 'free',
                'status' => 'suspended',
                'is_active' => false,
                'email' => 'support@aura.com'
            ],
        ];

        foreach ($tenantsData as $data) {
            $t = Tenant::find($data['id']);
            if (!$t) {
                $t = Tenant::create([
                    'id' => $data['id'],
                    'name' => $data['name'],
                    'data' => [
                        'name' => $data['name'],
                        'contact_email' => $data['email'],
                        'subscription' => [
                            'plan' => $data['plan'],
                            'status' => $data['status'],
                            'is_active' => $data['is_active'],
                            'features' => $data['plan'] === 'free' 
                                ? ['basic_catalog'] 
                                : ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding', 'ai_recommendations'],
                            'billing_provider' => 'stripe',
                            'stripe_price_id' => $data['plan'] === 'free' ? null : 'price_' . $data['plan'] . '_monthly',
                        ],
                        'theme' => [
                            'primary_color' => '#7f1d1d',
                            'logo' => '/images/logo.png',
                        ],
                    ],
                ]);
            } else {
                $t->name = $data['name'];
                $t->data = array_merge($t->data ?? [], [
                    'name' => $data['name'],
                    'contact_email' => $data['email'],
                    'subscription' => [
                        'plan' => $data['plan'],
                        'status' => $data['status'],
                        'is_active' => $data['is_active'],
                        'features' => $data['plan'] === 'free' 
                            ? ['basic_catalog'] 
                            : ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding', 'ai_recommendations'],
                        'billing_provider' => 'stripe',
                        'stripe_price_id' => $data['plan'] === 'free' ? null : 'price_' . $data['plan'] . '_monthly',
                    ],
                ]);
                $t->save();
            }

            $dom = Domain::firstOrNew([
                'domain' => $data['domain'],
            ]);
            $dom->tenant_id = $t->id;
            $dom->save();
        }
    }
}

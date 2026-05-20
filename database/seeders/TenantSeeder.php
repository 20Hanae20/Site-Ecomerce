<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Stancl\Tenancy\Database\Models\Domain;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::query()
            ->where('data->name', 'Maison de Parfum Demo')
            ->first();

        if (! $tenant) {
            $tenant = Tenant::create([
                'data' => [
                    'name' => 'Maison de Parfum Demo',
                    'theme' => [
                        'primary_color' => '#7f1d1d',
                        'logo' => '/images/logo.png',
                    ],
                ],
            ]);
        }

        $domain = Domain::firstOrNew([
            'domain' => 'demo.localhost',
        ]);

        if (! $domain->exists) {
            $domain->tenant_id = $tenant->id;
            $domain->save();
        } elseif ($domain->tenant_id !== $tenant->id) {
            $existingTenant = Tenant::find($domain->tenant_id);

            if (! $existingTenant || empty($existingTenant->data['name'])) {
                $domain->tenant_id = $tenant->id;
                $domain->save();
            } else {
                throw new \RuntimeException('Domain "demo.localhost" is already assigned to another tenant.');
            }
        }
    }
}

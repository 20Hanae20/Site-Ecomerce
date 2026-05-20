<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\Subscription;
use Illuminate\Console\Command;
use Stancl\Tenancy\Database\Models\Domain;

class TenantCommand extends Command
{
    protected $signature = 'tenant {action} {--id=} {--name=} {--domain=} {--plan=free}';
    protected $description = 'Manage tenants. Actions: create, list, delete, assign-domain, info';

    public function handle()
    {
        $action = $this->argument('action');

        return match($action) {
            'create' => $this->createTenant(),
            'list' => $this->listTenants(),
            'delete' => $this->deleteTenant(),
            'assign-domain' => $this->assignDomain(),
            'info' => $this->tenantInfo(),
            default => $this->error("Unknown action: {$action}"),
        };
    }

    private function createTenant()
    {
        $name = $this->option('name') ?? $this->ask('Tenant name');
        $domain = $this->option('domain') ?? $this->ask('Domain');
        $plan = $this->option('plan') ?? 'free';

        $tenant = Tenant::create([
            'data' => [
                'name' => $name,
                'plan' => $plan,
                'subscription' => [
                    'plan' => $plan,
                    'status' => 'active',
                    'features' => $this->getFeaturesByPlan($plan),
                ],
                'theme' => [
                    'primary_color' => '#7f1d1d',
                    'logo' => '/images/logo.png',
                ],
            ],
        ]);

        Domain::create([
            'domain' => $domain,
            'tenant_id' => $tenant->id,
        ]);

        // Create a local subscription record (Cashier/Stripe will be integrated separately)
        Subscription::create([
            'tenant_id' => $tenant->id,
            'name' => $plan,
            'stripe_id' => null,
            'stripe_status' => 'pending',
            'stripe_price' => $plan,
        ]);

        $this->info("Tenant created successfully!");
        $this->info("ID: {$tenant->id}");
        $this->info("Name: {$name}");
        $this->info("Domain: {$domain}");
        $this->info("Plan: {$plan}");

        return 0;
    }

    private function listTenants()
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->info('No tenants found.');
            return 0;
        }

        $rows = $tenants->map(function ($tenant) {
            $domain = Domain::where('tenant_id', $tenant->id)->first();
            return [
                $tenant->id,
                $tenant->data['name'] ?? 'N/A',
                $domain?->domain ?? 'N/A',
                $tenant->data['subscription']['plan'] ?? 'free',
                $tenant->created_at->format('Y-m-d H:i'),
            ];
        })->toArray();

        $this->table(['ID', 'Name', 'Domain', 'Plan', 'Created'], $rows);

        return 0;
    }

    private function deleteTenant()
    {
        $id = $this->option('id') ?? $this->ask('Tenant ID');

        $tenant = Tenant::find($id);

        if (!$tenant) {
            $this->error("Tenant not found with ID: {$id}");
            return 1;
        }

        if (!$this->confirm("Are you sure you want to delete tenant '{$tenant->data['name']}'? This action cannot be undone.")) {
            $this->info('Aborted.');
            return 0;
        }

        Domain::where('tenant_id', $tenant->id)->delete();
        $tenant->delete();

        $this->info("Tenant deleted successfully!");

        return 0;
    }

    private function assignDomain()
    {
        $id = $this->option('id') ?? $this->ask('Tenant ID');
        $domain = $this->option('domain') ?? $this->ask('New domain');

        $tenant = Tenant::find($id);

        if (!$tenant) {
            $this->error("Tenant not found with ID: {$id}");
            return 1;
        }

        $existing = Domain::where('domain', $domain)->first();

        if ($existing) {
            $this->error("Domain already assigned to another tenant.");
            return 1;
        }

        Domain::create([
            'domain' => $domain,
            'tenant_id' => $tenant->id,
        ]);

        $this->info("Domain assigned successfully!");
        $this->info("Tenant ID: {$tenant->id}");
        $this->info("Domain: {$domain}");

        return 0;
    }

    private function tenantInfo()
    {
        $id = $this->option('id') ?? $this->ask('Tenant ID');

        $tenant = Tenant::find($id);

        if (!$tenant) {
            $this->error("Tenant not found with ID: {$id}");
            return 1;
        }

        $domain = Domain::where('tenant_id', $tenant->id)->first();

        $this->info("=== Tenant Information ===");
        $this->line("ID: {$tenant->id}");
        $this->line("Name: {$tenant->data['name'] ?? 'N/A'}");
        $this->line("Domain: {$domain?->domain ?? 'N/A'}");
        $this->line("Plan: {$tenant->data['subscription']['plan'] ?? 'free'}");
        $this->line("Created: {$tenant->created_at}");
        $this->line("Updated: {$tenant->updated_at}");

        $this->info("\n=== Tenant Data ===");
        $this->line(json_encode($tenant->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return 0;
    }

    private function getFeaturesByPlan($plan)
    {
        return match($plan) {
            'free' => ['basic_catalog', 'reviews'],
            'starter' => ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding'],
            'professional' => ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding', 'multi_warehouse', 'advanced_promotions', 'api_access'],
            'enterprise' => ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding', 'multi_warehouse', 'advanced_promotions', 'api_access', 'white_label', 'dedicated_support'],
            default => ['basic_catalog', 'reviews'],
        };
    }
}

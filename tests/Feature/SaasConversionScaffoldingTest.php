<?php

namespace Tests\Feature;

use App\Models\Tenant;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaasConversionScaffoldingTest extends TestCase
{
    use RefreshDatabase;
    public function test_tenancy_uses_application_tenant_model(): void
    {
        $this->assertSame(Tenant::class, config('tenancy.tenant_model'));
    }

    public function test_subscription_plans_expose_stripe_billing_scaffold(): void
    {
        $tenant = Tenant::create([
            'id' => 2,
            'name' => 'Test Tenant',
        ]);
        $tenant->domains()->create(['domain' => 'localhost']);

        $response = $this->getJson('/api/subscription/plans');

        $response->assertOk()
            ->assertJsonPath('billing.provider', 'stripe')
            ->assertJsonPath('billing.cashier_scaffolded', true);
    }

    public function test_sensitive_routes_are_wired_with_role_middleware(): void
    {
        $upgradeRoute = collect(Route::getRoutes()->getRoutes())
            ->firstWhere('uri', 'api/subscription/upgrade');
        $tenantUpdateRoute = collect(Route::getRoutes()->getRoutes())
            ->firstWhere('uri', 'api/tenant');

        $this->assertNotNull($upgradeRoute);
        $this->assertNotNull($tenantUpdateRoute);
        $this->assertContains(
            'role:admin,super_admin,gestionnaire',
            $upgradeRoute->middleware()
        );
        $this->assertContains(
            'role:admin,super_admin,gestionnaire',
            $tenantUpdateRoute->middleware()
        );
    }
}

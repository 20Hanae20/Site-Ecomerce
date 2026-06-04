<?php

namespace App\Services;

use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;
use Illuminate\Support\Facades\Cache;

/**
 * Tenant Management Service
 * Handles multi-tenant operations, isolation, and resolution
 */
class TenantService
{
    /**
     * Create a new tenant
     * 
     * @param array $data - Tenant data (name, domain, plan)
     * @return Tenant Created tenant
     */
    public function createTenant($data)
    {
        $tenant = Tenant::create([
            'data' => [
                'company_name' => $data['name'] ?? 'Company',
                'plan' => $data['plan'] ?? 'free',
                'created_at' => now()
            ]
        ]);

        // Create domain
        if (isset($data['domain'])) {
            Domain::create([
                'domain' => $data['domain'],
                'tenant_id' => $tenant->id
            ]);
        }

        Cache::forget('tenants_list');

        return $tenant;
    }

    /**
     * Resolve tenant by domain
     * 
     * @param string $domain
     * @return Tenant|null
     */
    public function resolveTenant($domain)
    {
        $cacheKey = "tenant:domain:{$domain}";
        
        return Cache::remember($cacheKey, 3600, function() use ($domain) {
            $domainRecord = Domain::where('domain', $domain)->first();
            
            if ($domainRecord) {
                return Tenant::find($domainRecord->tenant_id);
            }

            return null;
        });
    }

    /**
     * Update tenant data
     * 
     * @param int $tenantId
     * @param array $data
     * @return Tenant Updated tenant
     */
    public function updateTenant($tenantId, $data)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        $tenantData = $tenant->data ?? [];
        $tenantData = array_merge($tenantData, $data);
        
        $tenant->update(['data' => $tenantData]);

        Cache::forget("tenant:domain:*");

        return $tenant;
    }

    /**
     * Get tenant metrics (revenue, users, orders, etc.)
     * 
     * @param int $tenantId
     * @return array Metrics
     */
    public function getTenantMetrics($tenantId)
    {
        $cacheKey = "tenant:metrics:{$tenantId}";

        return Cache::remember($cacheKey, 3600, function() use ($tenantId) {
            // Initialize tenant context
            \tenancy()->initialize(Tenant::find($tenantId));

            return [
                'user_count' => \App\Models\User::count(),
                'order_count' => \App\Models\Order::count(),
                'revenue' => \App\Models\Order::sum('total') ?? 0,
                'product_count' => \App\Models\Perfume::count(),
                'review_count' => \App\Models\Review::count(),
                'avg_order_value' => \App\Models\Order::avg('total') ?? 0,
                'conversion_rate' => $this->calculateConversionRate($tenantId),
                'active_users' => $this->getActiveUsersCount($tenantId)
            ];
        });
    }

    /**
     * Delete tenant and all associated data
     * 
     * @param int $tenantId
     * @return bool
     */
    public function deleteTenant($tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        // Delete domains
        Domain::where('tenant_id', $tenantId)->delete();
        
        // Delete tenant database (handled by Stancl Tenancy)
        $tenant->delete();

        Cache::forget("tenant:domain:*");
        Cache::forget("tenant:metrics:{$tenantId}");

        return true;
    }

    /**
     * List all tenants
     * 
     * @return array Tenants list
     */
    public function listTenants()
    {
        return Cache::remember('tenants_list', 3600, function() {
            return Tenant::with('domains')->get()->toArray();
        });
    }

    /**
     * Check if tenant has feature enabled
     * 
     * @param int $tenantId
     * @param string $feature
     * @return bool
     */
    public function hasFeature($tenantId, $feature)
    {
        $tenant = Tenant::find($tenantId);
        
        if (!$tenant) {
            return false;
        }

        $data = $tenant->data ?? [];
        $plan = $data['plan'] ?? 'free';

        $features = [
            'free' => ['basic_products', 'basic_orders'],
            'pro' => ['basic_products', 'basic_orders', 'ai_recommendations', 'analytics'],
            'enterprise' => ['basic_products', 'basic_orders', 'ai_recommendations', 'advanced_analytics', 'custom_branding', 'api_access']
        ];

        return in_array($feature, $features[$plan] ?? []);
    }

    /**
     * Upgrade tenant plan
     * 
     * @param int $tenantId
     * @param string $newPlan
     * @return Tenant Updated tenant
     */
    public function upgradePlan($tenantId, $newPlan)
    {
        $validPlans = ['free', 'pro', 'enterprise'];

        if (!in_array($newPlan, $validPlans)) {
            throw new \InvalidArgumentException("Invalid plan: {$newPlan}");
        }

        return $this->updateTenant($tenantId, ['plan' => $newPlan]);
    }

    /**
     * === PRIVATE HELPERS ===
     */

    /**
     * Calculate conversion rate for tenant
     */
    private function calculateConversionRate($tenantId)
    {
        $totalUsers = \App\Models\User::count();
        $buyingUsers = \App\Models\Order::distinct('user_id')->count('user_id');

        return $totalUsers > 0 ? ($buyingUsers / $totalUsers) * 100 : 0;
    }

    /**
     * Get active users count (users with recent activity)
     */
    private function getActiveUsersCount($tenantId)
    {
        return \App\Models\User::where('updated_at', '>=', now()->subDays(30))->count();
    }
}

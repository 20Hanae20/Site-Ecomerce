<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Get current tenant's subscription/plan info
     */
    public function current(Request $request)
    {
        if (!tenant()) {
            return response()->json(['message' => 'No tenant context'], 400);
        }

        $tenant = tenant();
        $subscription = $tenant->data['subscription'] ?? [
            'plan' => 'free',
            'status' => 'active',
            'features' => ['basic_catalog', 'reviews'],
            'billing_provider' => 'stripe',
            'stripe_price_id' => null,
        ];

        $subscription['cashier_scaffolded'] = true;
        $subscription['stripe'] = [
            'customer_id' => $tenant->stripe_id ?? null,
            'payment_method_type' => $tenant->pm_type ?? null,
            'payment_method_last_four' => $tenant->pm_last_four ?? null,
            'trial_ends_at' => $tenant->trial_ends_at?->toISOString(),
        ];

        return response()->json($subscription, 200);
    }

    /**
     * Check subscription status (simplified for frontend)
     * GET /subscription/status
     * 
     * Returns whether subscription is active and what plan is active
     * Used to verify tenant can access paid features
     */
    public function status(Request $request)
    {
        if (!tenant()) {
            return response()->json([
                'active' => false,
                'plan' => 'free',
                'message' => 'No tenant context'
            ], 400);
        }

        $tenant = tenant();
        $subscription = $tenant->data['subscription'] ?? [];

        // Determine if subscription is active
        $isActive = ($subscription['is_active'] ?? false) && 
                   in_array($subscription['status'] ?? 'active', ['active', 'trialing']);

        // Check if expired
        $isExpired = false;
        if ($subscription['current_period_end'] ?? null) {
            $isExpired = strtotime($subscription['current_period_end']) < time();
        }

        $isActive = $isActive && !$isExpired;

        return response()->json([
            'active' => $isActive,
            'plan' => $subscription['plan'] ?? 'free',
            'status' => $subscription['status'] ?? 'active',
            'features' => $subscription['features'] ?? ['basic_catalog', 'reviews'],
            'current_period_end' => $subscription['current_period_end'] ?? null,
            'trial_ends_at' => $subscription['trial_end'] ?? null,
            'is_trial' => ($subscription['status'] ?? null) === 'trialing',
            'stripe_customer_id' => $subscription['stripe_customer_id'] ?? null,
        ], 200);
    }

    /**
     * Check if a feature is available in current plan
     */
    public function hasFeature(Request $request)
    {
        $feature = $request->input('feature');

        if (!$feature) {
            return response()->json(['message' => 'Feature name required'], 400);
        }

        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['available' => false], 200);
        }

        $subscription = $tenant->data['subscription'] ?? [];
        $features = $subscription['features'] ?? [];

        return response()->json([
            'feature' => $feature,
            'available' => in_array($feature, $features),
        ], 200);
    }

    /**
     * List available plans
     */
    public function plans()
    {
        $plans = $this->planCatalog();

        return response()->json([
            'plans' => array_values($plans),
            'billing' => [
                'provider' => 'stripe',
                'publishable_key_configured' => ! empty(config('services.stripe.key')),
                'cashier_scaffolded' => true,
            ],
        ], 200);
    }

    /**
     * Upgrade tenant plan (admin only)
     */
    public function upgrade(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!tenant()) {
            return response()->json(['message' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'plan' => 'required|in:free,starter,professional,enterprise',
        ]);

        $tenant = tenant();
        $tenant->data = $tenant->data ?? [];
        $tenant->data['subscription'] = [
            'plan' => $validated['plan'],
            'status' => 'active',
            'upgraded_at' => now()->toDateTimeString(),
        ];

        // Set features based on plan
        $planCatalog = $this->planCatalog();
        $selectedPlan = $planCatalog[$validated['plan']];
        $planFeatures = array_column($planCatalog, 'features', 'id');

        $tenant->data['subscription']['features'] = $planFeatures[$validated['plan']] ?? [];
        $tenant->data['subscription']['billing_provider'] = 'stripe';
        $tenant->data['subscription']['stripe_price_id'] = $selectedPlan['stripe_price_id'] ?? null;
        $tenant->save();

        return response()->json([
            'message' => 'Plan upgraded successfully',
            'subscription' => $tenant->data['subscription'],
        ], 200);
    }

    private function planCatalog(): array
    {
        return [
            'free' => [
                'id' => 'free',
                'name' => 'Gratuit',
                'price' => 0,
                'billing_period' => 'month',
                'stripe_price_id' => null,
                'features' => [
                    'basic_catalog',
                    'reviews',
                ],
                'limitations' => [
                    'max_products' => 50,
                    'max_custom_fields' => 0,
                    'ai_recommendations' => false,
                ],
            ],
            'starter' => [
                'id' => 'starter',
                'name' => 'Démarrage',
                'price' => 29.99,
                'billing_period' => 'month',
                'stripe_price_id' => config('services.stripe.prices.starter'),
                'features' => [
                    'basic_catalog',
                    'reviews',
                    'advanced_analytics',
                    'custom_branding',
                    'ai_recommendations',
                ],
                'limitations' => [
                    'max_products' => 500,
                    'max_custom_fields' => 5,
                    'ai_recommendations' => true,
                ],
            ],
            'professional' => [
                'id' => 'professional',
                'name' => 'Professionnel',
                'price' => 99.99,
                'billing_period' => 'month',
                'stripe_price_id' => config('services.stripe.prices.professional'),
                'features' => [
                    'basic_catalog',
                    'reviews',
                    'advanced_analytics',
                    'custom_branding',
                    'ai_recommendations',
                    'multi_warehouse',
                    'advanced_promotions',
                    'api_access',
                ],
                'limitations' => [
                    'max_products' => 5000,
                    'max_custom_fields' => 20,
                    'ai_recommendations' => true,
                ],
            ],
            'enterprise' => [
                'id' => 'enterprise',
                'name' => 'Entreprise',
                'price' => 'custom',
                'billing_period' => 'month',
                'stripe_price_id' => null,
                'features' => [
                    'basic_catalog',
                    'reviews',
                    'advanced_analytics',
                    'custom_branding',
                    'ai_recommendations',
                    'multi_warehouse',
                    'advanced_promotions',
                    'api_access',
                    'white_label',
                    'dedicated_support',
                ],
                'limitations' => [
                    'max_products' => 'unlimited',
                    'max_custom_fields' => 'unlimited',
                    'ai_recommendations' => true,
                ],
            ],
        ];
    }
}

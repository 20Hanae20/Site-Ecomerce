<?php

namespace App\Http\Controllers\Api;

use App\Models\Tenant;
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
        ];

        return response()->json($subscription, 200);
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
        return response()->json([
            'plans' => [
                [
                    'id' => 'free',
                    'name' => 'Gratuit',
                    'price' => 0,
                    'billing_period' => 'month',
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
                [
                    'id' => 'starter',
                    'name' => 'Démarrage',
                    'price' => 29.99,
                    'billing_period' => 'month',
                    'features' => [
                        'basic_catalog',
                        'reviews',
                        'advanced_analytics',
                        'custom_branding',
                    ],
                    'limitations' => [
                        'max_products' => 500,
                        'max_custom_fields' => 5,
                        'ai_recommendations' => true,
                    ],
                ],
                [
                    'id' => 'professional',
                    'name' => 'Professionnel',
                    'price' => 99.99,
                    'billing_period' => 'month',
                    'features' => [
                        'basic_catalog',
                        'reviews',
                        'advanced_analytics',
                        'custom_branding',
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
                [
                    'id' => 'enterprise',
                    'name' => 'Entreprise',
                    'price' => 'custom',
                    'billing_period' => 'month',
                    'features' => [
                        'basic_catalog',
                        'reviews',
                        'advanced_analytics',
                        'custom_branding',
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
        $planFeatures = [
            'free' => ['basic_catalog', 'reviews'],
            'starter' => ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding'],
            'professional' => ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding', 'multi_warehouse', 'advanced_promotions', 'api_access'],
            'enterprise' => ['basic_catalog', 'reviews', 'advanced_analytics', 'custom_branding', 'multi_warehouse', 'advanced_promotions', 'api_access', 'white_label', 'dedicated_support'],
        ];

        $tenant->data['subscription']['features'] = $planFeatures[$validated['plan']] ?? [];
        $tenant->save();

        return response()->json([
            'message' => 'Plan upgraded successfully',
            'subscription' => $tenant->data['subscription'],
        ], 200);
    }
}

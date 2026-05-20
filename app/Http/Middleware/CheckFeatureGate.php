<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckFeatureGate
{
    /**
     * Handle an incoming request to check if a feature is available for the tenant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  $feature
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $feature = null)
    {
        if (!$feature) {
            return $next($request);
        }

        $tenant = tenant();
        if (!$tenant) {
            return response()->json(['message' => 'No tenant context'], 403);
        }

        $subscription = $tenant->data['subscription'] ?? [];
        $availableFeatures = $subscription['features'] ?? [];

        if (!in_array($feature, $availableFeatures)) {
            return response()->json([
                'message' => "Feature '{$feature}' is not available in your plan",
                'feature' => $feature,
                'required_plan' => $this->getMinimumPlanForFeature($feature),
            ], 403);
        }

        return $next($request);
    }

    /**
     * Get the minimum plan required for a feature
     */
    private function getMinimumPlanForFeature($feature)
    {
        $featurePlans = [
            'basic_catalog' => 'free',
            'reviews' => 'free',
            'advanced_analytics' => 'starter',
            'custom_branding' => 'starter',
            'ai_recommendations' => 'starter',
            'multi_warehouse' => 'professional',
            'advanced_promotions' => 'professional',
            'api_access' => 'professional',
            'white_label' => 'enterprise',
            'dedicated_support' => 'enterprise',
        ];

        return $featurePlans[$feature] ?? 'enterprise';
    }
}

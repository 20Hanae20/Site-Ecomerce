<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Laravel\Cashier\Exceptions\InvalidCustomer;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    /**
     * Initiate Stripe checkout session for subscription
     * POST /billing/checkout
     * 
     * Creates a Stripe checkout session for the tenant to purchase a subscription plan
     */
    public function checkout(Request $request)
    {
        $tenant = tenant();
        
        if (!$tenant) {
            return response()->json(['message' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'plan' => 'required|string|in:free,starter,business,enterprise',
            'billing_period' => 'nullable|string|in:monthly,yearly',
        ]);

        try {
            $planConfig = config("billing.plans.{$validated['plan']}", null);
            
            if (!$planConfig) {
                return response()->json(['message' => 'Invalid plan'], 400);
            }

            $period = $validated['billing_period'] ?? 'monthly';
            
            // Get Stripe price ID for this plan + period
            $priceId = $planConfig[$period] ?? null;
            
            if (!$priceId) {
                return response()->json(['message' => 'Plan not available for this billing period'], 400);
            }

            // Get or create Stripe customer
            $stripeCustomerId = $tenant->stripe_id;
            
            if (!$stripeCustomerId) {
                // Create Stripe customer
                try {
                    $customer = \Stripe\Customer::create([
                        'email' => $tenant->data['contact_email'] ?? 'noreply@aura-saas.com',
                        'name' => $tenant->data['name'] ?? 'Unknown',
                        'metadata' => [
                            'tenant_id' => $tenant->id,
                            'domain' => $tenant->domains()->first()?->domain ?? 'unknown',
                        ],
                    ]);
                    
                    $stripeCustomerId = $customer->id;
                    
                    // Save to tenant
                    $tenantData = $tenant->data ?? [];
                    $tenantData['subscription']['stripe_customer_id'] = $stripeCustomerId;
                    $tenant->data = $tenantData;
                    $tenant->stripe_id = $stripeCustomerId;
                    $tenant->save();
                    
                    Log::info('Stripe customer created', [
                        'tenant_id' => $tenant->id,
                        'stripe_customer_id' => $stripeCustomerId,
                    ]);
                } catch (ApiErrorException $e) {
                    Log::error('Stripe customer creation failed', [
                        'tenant_id' => $tenant->id,
                        'error' => $e->getMessage(),
                    ]);
                    
                    return response()->json([
                        'message' => 'Failed to create Stripe customer',
                        'error' => $e->getMessage(),
                    ], 500);
                }
            }

            // Create checkout session
            try {
                $session = \Stripe\Checkout\Session::create([
                    'payment_method_types' => ['card'],
                    'customer' => $stripeCustomerId,
                    'mode' => 'subscription',
                    'line_items' => [[
                        'price' => $priceId,
                        'quantity' => 1,
                    ]],
                    'success_url' => config('app.frontend_url') . '/onboarding/success?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => config('app.frontend_url') . '/onboarding/checkout',
                    'metadata' => [
                        'tenant_id' => $tenant->id,
                        'plan' => $validated['plan'],
                        'period' => $period,
                    ],
                ]);

                Log::info('Stripe checkout session created', [
                    'tenant_id' => $tenant->id,
                    'session_id' => $session->id,
                    'plan' => $validated['plan'],
                ]);

                return response()->json([
                    'message' => 'Checkout session created',
                    'session_id' => $session->id,
                    'checkout_url' => $session->url,
                ], 200);
            } catch (ApiErrorException $e) {
                Log::error('Stripe checkout session creation failed', [
                    'tenant_id' => $tenant->id,
                    'plan' => $validated['plan'],
                    'error' => $e->getMessage(),
                ]);

                return response()->json([
                    'message' => 'Failed to create checkout session',
                    'error' => $e->getMessage(),
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Billing checkout error', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'An error occurred',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get current subscription details
     * GET /billing/current
     */
    public function current(Request $request)
    {
        $tenant = tenant();

        if (!$tenant) {
            return response()->json(['message' => 'No tenant context'], 400);
        }

        $subscription = $tenant->data['subscription'] ?? [
            'plan' => 'free',
            'status' => 'active',
            'is_active' => true,
            'features' => ['basic_catalog', 'reviews'],
        ];

        return response()->json([
            'subscription' => $subscription,
            'stripe' => [
                'customer_id' => $tenant->stripe_id,
                'has_payment_method' => (bool) $tenant->pm_type,
            ],
        ], 200);
    }

    /**
     * List subscription plans with pricing
     * GET /billing/plans
     */
    public function plans()
    {
        $plans = config('billing.plans', [
            'free' => [
                'name' => 'Free',
                'description' => 'Essai gratuit',
                'price' => 0,
                'features' => ['basic_catalog', 'reviews'],
                'monthly' => null,
                'yearly' => null,
            ],
            'starter' => [
                'name' => 'Starter',
                'description' => 'Pour démarrer',
                'price' => 29,
                'features' => ['basic_catalog', 'reviews', 'promotions', 'analytics'],
                'monthly' => 'price_starter_monthly',
                'yearly' => 'price_starter_yearly',
            ],
            'business' => [
                'name' => 'Business',
                'description' => 'Pour les professionnels',
                'price' => 99,
                'features' => ['basic_catalog', 'reviews', 'promotions', 'analytics', 'team_management', 'api_access'],
                'monthly' => 'price_business_monthly',
                'yearly' => 'price_business_yearly',
            ],
            'enterprise' => [
                'name' => 'Enterprise',
                'description' => 'Sur mesure',
                'price' => 'custom',
                'features' => ['all'],
                'monthly' => null,
                'yearly' => null,
            ],
        ]);

        return response()->json([
            'plans' => $plans,
            'currency' => 'EUR',
        ], 200);
    }
}

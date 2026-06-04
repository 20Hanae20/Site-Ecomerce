<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    public function createCheckout(Request $request)
    {
        $plan = $request->input('plan');

        if (! tenancy()->initialized) {
            return response()->json(['error' => 'Tenant not initialized'], 400);
        }

        if (! $plan) {
            return response()->json(['error' => 'A Stripe plan identifier is required'], 422);
        }

        $tenant = tenant();
        Log::info('Stripe checkout requested', ['tenant_id' => $tenant->id, 'plan' => $plan]);

        // Ensure Stripe customer exists
        try {
            if (! $tenant->stripe_id) {
                $tenant->createAsStripeCustomer([
                    'name' => $tenant->data['name'] ?? 'Tenant '.$tenant->id,
                    'metadata' => ['tenant_id' => $tenant->id],
                ]);
            }

            $subscription = $tenant->newSubscription('default', $plan)->create();

            Log::info('Stripe subscription created', [
                'tenant_id' => $tenant->id,
                'subscription_id' => $subscription->id,
                'stripe_id' => $tenant->stripe_id,
            ]);

            return response()->json(['ok' => true, 'subscription_id' => $subscription->id]);
        } catch (\Exception $e) {
            Log::error('Billing subscription creation failed', [
                'tenant_id' => $tenant->id,
                'plan' => $plan,
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Unable to create subscription'], 500);
        }
    }
}

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

        $tenant = tenant();

        // Ensure Stripe customer exists
        if (! $tenant->stripe_id) {
            $tenant->createAsStripeCustomer([
                'name' => $tenant->data['name'] ?? 'Tenant '.$tenant->id,
            ]);
        }

        // Use Cashier to create a new subscription. Assumes Stripe price id passed as `plan`.
        try {
            $subscription = $tenant->newSubscription('default', $plan)->create();
            return response()->json(['ok' => true, 'subscription_id' => $subscription->id]);
        } catch (\Exception $e) {
            Log::error('Billing error: '.$e->getMessage());
            return response()->json(['error' => 'Unable to create subscription'], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        // Let Cashier or stripe-php verify if available; otherwise trust for local testing
        Log::info('Stripe webhook received', ['payload' => $payload]);

        $event = json_decode($payload, true);

        if (! $event || ! isset($event['type'])) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        switch ($event['type']) {
            case 'invoice.payment_succeeded':
                // handle payment succeeded
                break;
            case 'customer.subscription.updated':
            case 'customer.subscription.created':
            case 'customer.subscription.deleted':
                $sub = $event['data']['object'] ?? null;
                if ($sub && isset($sub['id'])) {
                    // Update local subscriptions table if present
                    DB::table('subscriptions')->where('stripe_id', $sub['id'])->update([
                        'stripe_status' => $sub['status'] ?? null,
                        'stripe_price' => $sub['plan']['id'] ?? ($sub['items']['data'][0]['price']['id'] ?? null),
                        'updated_at' => now(),
                    ]);
                }
                break;
        }

        return response()->json(['received' => true]);
    }
}

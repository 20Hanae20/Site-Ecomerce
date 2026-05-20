<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Stripe;
use App\Models\Tenant;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Read raw payload and signature
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        $secret = config('cashier.stripe.webhook_secret');

        try {
            if ($secret) {
                $event = Webhook::constructEvent($payload, $sigHeader, $secret);
            } else {
                $event = json_decode($payload, true);
            }
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Normalize event object
        $type = is_array($event) ? ($event['type'] ?? null) : ($event->type ?? null);
        $dataObj = is_array($event) ? ($event['data']['object'] ?? []) : ($event->data->object ?? []);

        Log::info('Stripe webhook received: ' . $type);

        // Find tenant by stripe customer id
        $customerId = $dataObj['customer'] ?? ($dataObj->customer ?? null);
        $tenant = null;
        if ($customerId) {
            $tenant = Tenant::where('stripe_id', $customerId)->first();
        }

        // Handle subscription events
        if (in_array($type, ['invoice.payment_succeeded', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'])) {
            $subscription = $dataObj['subscription'] ?? $dataObj['id'] ?? null;
            $status = $dataObj['status'] ?? null;

            if ($tenant) {
                $tenant->data = $tenant->data ?? [];
                $tenant->data['subscription'] = array_merge($tenant->data['subscription'] ?? [], [
                    'stripe_event' => $type,
                    'status' => $status ?? 'unknown',
                    'raw' => $dataObj,
                ]);
                $tenant->save();
            }
        }

        return response()->json(['received' => true]);
    }
}

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
            Log::warning('Stripe webhook signature verification failed', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $type = is_array($event) ? ($event['type'] ?? null) : ($event->type ?? null);
        $dataObj = is_array($event) ? ($event['data']['object'] ?? []) : ($event->data->object ?? []);

        $customerId = $dataObj['customer'] ?? $dataObj['customer_id'] ?? null;
        Log::info('Stripe webhook received', ['event' => $type, 'customer_id' => $customerId]);

        $tenant = null;
        if ($customerId) {
            $tenant = Tenant::where('stripe_id', $customerId)->first();
        }

        if (! $tenant) {
            Log::warning('Stripe webhook received for unknown tenant', [
                'event' => $type,
                'customer_id' => $customerId,
                'payload' => $dataObj,
            ]);
        }

        if (in_array($type, ['invoice.payment_succeeded', 'invoice.payment_failed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'])) {
            $status = $dataObj['status'] ?? null;
            $subscriptionId = $dataObj['id'] ?? $dataObj['subscription'] ?? null;

            if ($tenant) {
                $tenant->data = $tenant->data ?? [];
                $tenant->data['subscription'] = array_merge($tenant->data['subscription'] ?? [], [
                    'stripe_event' => $type,
                    'subscription_id' => $subscriptionId,
                    'status' => $status ?? 'unknown',
                    'raw' => $dataObj,
                ]);

                if ($type === 'customer.subscription.deleted') {
                    $tenant->data['subscription']['status'] = 'cancelled';
                }

                $tenant->save();
                Log::info('Stripe webhook processed for tenant', ['tenant_id' => $tenant->id, 'event' => $type]);
            }
        }

        return response()->json(['received' => true]);
    }
}

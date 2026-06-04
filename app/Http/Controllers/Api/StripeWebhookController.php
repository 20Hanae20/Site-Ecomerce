<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events
     * POST /stripe/webhook
     * 
     * Webhook endpoint for Stripe to notify us of subscription events
     * Must be configured in Stripe dashboard at: https://dashboard.stripe.com/webhooks
     * 
     * Events handled:
     * - customer.subscription.created
     * - customer.subscription.updated
     * - customer.subscription.deleted
     * - invoice.payment_succeeded
     * - invoice.payment_failed
     * - checkout.session.completed
     */
    public function handle(Request $request)
    {
        $sig_header = $request->header('Stripe-Signature');
        $webhook_secret = config('services.stripe.webhook_secret');

        if (app()->environment('testing')) {
            $event = json_decode($request->getContent());
        } else {
            if (!$webhook_secret) {
                Log::error('Stripe webhook secret not configured');
                return response()->json(['error' => 'Webhook secret not configured'], 500);
            }

            try {
                $event = Webhook::constructEvent(
                    $request->getContent(),
                    $sig_header,
                    $webhook_secret
                );
            } catch (SignatureVerificationException $e) {
                Log::error('Stripe webhook signature verification failed', [
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Invalid signature'], 400);
            } catch (\Exception $e) {
                Log::error('Stripe webhook error', [
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Webhook error'], 400);
            }
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'customer.subscription.created':
                $this->handleSubscriptionCreated($event->data->object);
                break;

            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;

            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event->data->object);
                break;

            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event->data->object);
                break;

            default:
                Log::info('Unhandled Stripe webhook event', ['type' => $event->type]);
        }

        return response()->json(['success' => true, 'received' => true], 200);
    }

    /**
     * Handle checkout.session.completed
     * Triggered when customer successfully completes checkout
     */
    private function handleCheckoutSessionCompleted($session)
    {
        Log::info('Checkout session completed', [
            'session_id' => $session->id,
            'customer_id' => $session->customer,
        ]);

        $tenantId = $session->metadata?->tenant_id;
        $plan = $session->metadata?->plan;

        if (!$tenantId) {
            Log::error('Checkout session missing tenant_id in metadata');
            return;
        }

        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            Log::error('Tenant not found for checkout session', ['tenant_id' => $tenantId]);
            return;
        }

        // Update tenant subscription in metadata
        $tenantData = $tenant->data ?? [];
        $tenantData['subscription']['status'] = 'active';
        $tenantData['subscription']['is_active'] = true;
        $tenantData['subscription']['plan'] = $plan ?? 'starter';
        $tenantData['subscription']['stripe_customer_id'] = $session->customer;
        $tenantData['subscription']['checkout_session_id'] = $session->id;
        $tenantData['subscription']['last_payment_at'] = now()->toDateTimeString();

        $tenant->data = $tenantData;
        $tenant->save();

        Log::info('Tenant subscription updated after checkout', [
            'tenant_id' => $tenantId,
            'plan' => $plan,
            'stripe_customer_id' => $session->customer,
        ]);
    }

    /**
     * Handle customer.subscription.created
     * Triggered when a subscription is created
     */
    private function handleSubscriptionCreated($subscription)
    {
        Log::info('Subscription created', [
            'subscription_id' => $subscription->id,
            'customer_id' => $subscription->customer,
        ]);

        $tenant = $this->getTenantByStripeCustomer($subscription->customer);
        if (!$tenant) {
            Log::error('Tenant not found for subscription creation', [
                'stripe_customer_id' => $subscription->customer,
            ]);
            return;
        }

        // Update subscription data
        $tenantData = $tenant->data ?? [];
        $tenantData['subscription']['status'] = $subscription->status; // active, past_due, canceled, etc
        $tenantData['subscription']['is_active'] = in_array($subscription->status, ['active', 'trialing']);
        $tenantData['subscription']['stripe_subscription_id'] = $subscription->id;
        $tenantData['subscription']['current_period_start'] = $subscription->current_period_start;
        $tenantData['subscription']['current_period_end'] = $subscription->current_period_end;
        $tenantData['subscription']['trial_end'] = $subscription->trial_end;
        $tenantData['subscription']['cancel_at_period_end'] = $subscription->cancel_at_period_end;

        // Extract plan from price
        $tenantData['subscription']['plan'] = $this->getPlanFromPrice($subscription);

        $tenant->data = $tenantData;
        $tenant->save();

        Log::info('Tenant subscription created', [
            'tenant_id' => $tenant->id,
            'stripe_subscription_id' => $subscription->id,
            'plan' => $tenantData['subscription']['plan'] ?? 'unknown',
        ]);
    }

    /**
     * Handle customer.subscription.updated
     * Triggered when subscription details change (plan upgrade, downgrade, etc)
     */
    private function handleSubscriptionUpdated($subscription)
    {
        Log::info('Subscription updated', [
            'subscription_id' => $subscription->id,
            'customer_id' => $subscription->customer,
        ]);

        $tenant = $this->getTenantByStripeCustomer($subscription->customer);
        if (!$tenant) {
            Log::error('Tenant not found for subscription update', [
                'stripe_customer_id' => $subscription->customer,
            ]);
            return;
        }

        // Update subscription data
        $tenantData = $tenant->data ?? [];
        $tenantData['subscription']['status'] = $subscription->status;
        $tenantData['subscription']['is_active'] = in_array($subscription->status, ['active', 'trialing']);
        $tenantData['subscription']['current_period_start'] = $subscription->current_period_start;
        $tenantData['subscription']['current_period_end'] = $subscription->current_period_end;
        $tenantData['subscription']['trial_end'] = $subscription->trial_end;
        $tenantData['subscription']['cancel_at_period_end'] = $subscription->cancel_at_period_end;
        $tenantData['subscription']['plan'] = $this->getPlanFromPrice($subscription);

        $tenant->data = $tenantData;
        $tenant->save();

        Log::info('Tenant subscription updated', [
            'tenant_id' => $tenant->id,
            'plan' => $tenantData['subscription']['plan'] ?? 'unknown',
            'status' => $subscription->status,
        ]);
    }

    /**
     * Handle customer.subscription.deleted
     * Triggered when subscription is canceled
     */
    private function handleSubscriptionDeleted($subscription)
    {
        Log::info('Subscription deleted', [
            'subscription_id' => $subscription->id,
            'customer_id' => $subscription->customer,
        ]);

        $tenant = $this->getTenantByStripeCustomer($subscription->customer);
        if (!$tenant) {
            Log::error('Tenant not found for subscription deletion', [
                'stripe_customer_id' => $subscription->customer,
            ]);
            return;
        }

        // Update subscription data - revert to free plan
        $tenantData = $tenant->data ?? [];
        $tenantData['subscription']['status'] = 'canceled';
        $tenantData['subscription']['is_active'] = false;
        $tenantData['subscription']['plan'] = 'free';
        $tenantData['subscription']['stripe_subscription_id'] = null;
        $tenantData['subscription']['canceled_at'] = now()->toDateTimeString();

        $tenant->data = $tenantData;
        $tenant->save();

        Log::info('Tenant subscription canceled', [
            'tenant_id' => $tenant->id,
            'reverted_to' => 'free',
        ]);
    }

    /**
     * Handle invoice.payment_succeeded
     * Triggered when a payment succeeds
     */
    private function handleInvoicePaymentSucceeded($invoice)
    {
        Log::info('Invoice payment succeeded', [
            'invoice_id' => $invoice->id,
            'customer_id' => $invoice->customer,
            'amount' => $invoice->amount_paid,
        ]);

        $tenant = $this->getTenantByStripeCustomer($invoice->customer);
        if (!$tenant) {
            Log::error('Tenant not found for invoice payment', [
                'stripe_customer_id' => $invoice->customer,
            ]);
            return;
        }

        // Update last payment info
        $tenantData = $tenant->data ?? [];
        $tenantData['subscription']['last_payment_at'] = now()->toDateTimeString();
        $tenantData['subscription']['last_payment_status'] = 'succeeded';
        $tenantData['subscription']['payment_failure_count'] = 0; // Reset failure count

        $tenant->data = $tenantData;
        $tenant->save();

        Log::info('Tenant payment recorded', [
            'tenant_id' => $tenant->id,
            'invoice_id' => $invoice->id,
            'amount' => $invoice->amount_paid,
        ]);
    }

    /**
     * Handle invoice.payment_failed
     * Triggered when a payment fails
     */
    private function handleInvoicePaymentFailed($invoice)
    {
        Log::warning('Invoice payment failed', [
            'invoice_id' => $invoice->id,
            'customer_id' => $invoice->customer,
            'amount' => $invoice->amount_due,
        ]);

        $tenant = $this->getTenantByStripeCustomer($invoice->customer);
        if (!$tenant) {
            Log::error('Tenant not found for invoice payment failure', [
                'stripe_customer_id' => $invoice->customer,
            ]);
            return;
        }

        // Track payment failure
        $tenantData = $tenant->data ?? [];
        $tenantData['subscription']['last_payment_status'] = 'failed';
        $tenantData['subscription']['last_payment_at'] = now()->toDateTimeString();
        $tenantData['subscription']['payment_failure_count'] = ($tenantData['subscription']['payment_failure_count'] ?? 0) + 1;

        $tenant->data = $tenantData;
        $tenant->save();

        Log::warning('Tenant payment failed recorded', [
            'tenant_id' => $tenant->id,
            'invoice_id' => $invoice->id,
            'failure_count' => $tenantData['subscription']['payment_failure_count'],
        ]);

        // TODO: Send email to tenant about failed payment
    }

    /**
     * Helper: Get tenant by Stripe customer ID
     */
    private function getTenantByStripeCustomer($stripeCustomerId)
    {
        // Search tenant by stripe_id
        $tenant = Tenant::where('stripe_id', $stripeCustomerId)->first();

        if (!$tenant) {
            // Fallback: search in tenant metadata
            $tenant = Tenant::whereJsonContains('data->subscription->stripe_customer_id', $stripeCustomerId)->first();
        }

        return $tenant;
    }

    /**
     * Helper: Extract plan name from Stripe subscription
     */
    private function getPlanFromPrice($subscription)
    {
        if (empty($subscription->items->data)) {
            return 'unknown';
        }

        $item = $subscription->items->data[0];
        $priceId = $item->price->id;

        // Map Stripe price IDs to plan names
        $priceMap = [
            'price_starter_monthly' => 'starter',
            'price_starter_yearly' => 'starter',
            'price_business_monthly' => 'business',
            'price_business_yearly' => 'business',
            'price_enterprise_monthly' => 'enterprise',
            'price_enterprise_yearly' => 'enterprise',
        ];

        return $priceMap[$priceId] ?? 'unknown';
    }
}

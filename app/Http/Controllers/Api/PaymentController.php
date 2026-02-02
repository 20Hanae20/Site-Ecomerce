<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    private const AUTH_ERROR = 'Non autorisé';

    /**
     * Initiate payment for an order
     */
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:card,paypal,cash,bank_transfer,cod,stripe',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Verify order belongs to user
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => self::AUTH_ERROR], 403);
        }

        // Check if order is already paid
        if ($order->payment_status === 'completed') {
            return response()->json(['message' => 'Cette commande est déjà payée'], 400);
        }

        try {
            DB::beginTransaction();

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'payment_method' => $validated['payment_method'],
                'amount' => $order->total,
                'currency' => 'EUR',
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Paiement initié',
                'payment' => $payment->load('order')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Validate payment (simulate gateway callback)
     */
    public function validate(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|string',
            'gateway_response' => 'nullable|array',
        ]);

        // Verify payment belongs to user
        if ($payment->user_id !== $request->user()->id) {
            return response()->json(['message' => self::AUTH_ERROR], 403);
        }

        if ($payment->status === 'completed') {
            return response()->json(['message' => 'Paiement déjà validé'], 400);
        }

        try {
            DB::beginTransaction();

            // Mark payment as completed
            $payment->update([
                'status' => 'completed',
                'transaction_id' => $validated['transaction_id'],
                'gateway_response' => $validated['gateway_response'] ?? null,
                'paid_at' => now(),
            ]);

            // Update order status
            $payment->order->update([
                'payment_status' => 'completed',
                'status' => 'paid',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Paiement validé avec succès',
                'payment' => $payment->load('order')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Mark payment as failed
     */
    public function fail(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'failure_reason' => 'required|string',
        ]);

        // Verify payment belongs to user
        if ($payment->user_id !== $request->user()->id) {
            return response()->json(['message' => self::AUTH_ERROR], 403);
        }

        try {
            DB::beginTransaction();

            // Mark payment as failed
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $validated['failure_reason'],
            ]);

            // Update order payment status
            $payment->order->update([
                'payment_status' => 'failed',
            ]);

            // Optionally restore stock if needed
            // This depends on your business logic

            DB::commit();

            return response()->json([
                'message' => 'Paiement marqué comme échoué',
                'payment' => $payment
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * List user payments
     */
    public function index(Request $request)
    {
        $query = Payment::with('order')
            ->forUser($request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Get payment details
     */
    public function show(Request $request, Payment $payment)
    {
        // Verify payment belongs to user
        if ($payment->user_id !== $request->user()->id) {
            return response()->json(['message' => self::AUTH_ERROR], 403);
        }

        $payment->load(['order.items', 'order.shippingAddress']);

        return response()->json($payment);
    }
}

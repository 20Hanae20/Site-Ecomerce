<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Perfume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected const UNAUTHORIZED_MSG = 'Non autorisé';

    /**
     * Display a listing of user's orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['items', 'shippingAddress'])
            ->forUser($request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $orders = $query->paginate(10);

        return response()->json($orders);
    }

    /**
     * Store a newly created order from cart.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_address_id' => 'required|exists:addresses,id',
            'payment_method' => 'nullable|string|in:stripe,paypal,cod',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || ($cartItems = $cart->items()->with('perfume')->get())->isEmpty()) {
            return response()->json(['message' => 'Panier vide'], 400);
        }

        try {
            DB::beginTransaction();

            foreach ($cartItems as $item) {
                if ($item->perfume->stock < $item->quantity) {
                    throw new \Exception("Stock insuffisant pour {$item->perfume->name}");
                }
            }

            $subtotal = $cartItems->sum(fn($i) => $i->perfume->price * $i->quantity);
            $shippingCost = (float)(\App\Models\Setting::where('key', 'shipping_fee')->first()?->value ?? 0);
            $tax = 0;
            $total = $subtotal + $shippingCost + $tax;

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $validated['payment_method'] ?? 'stripe',
                'payment_status' => 'pending',
                'shipping_address_id' => $validated['shipping_address_id'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items (snapshot product data)
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'perfume_id' => $item->perfume_id,
                    'perfume_name' => $item->perfume->name,
                    'perfume_price' => $item->perfume->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->perfume->price * $item->quantity,
                ]);

                // Reserve stock (decrement temporarily)
                $item->perfume->decrement('stock', $item->quantity);
            }

            // Clear cart
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'message' => 'Commande créée avec succès',
                'order' => $order->load(['items', 'shippingAddress'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, Order $order)
    {
        // Verify ownership OR Admin status
        $user = $request->user();
        if ($order->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $order->load(['items.perfume', 'shippingAddress', 'user:id,name,email']);

        return response()->json($order);
    }

    /**
     * Admin: List all orders for management
     */
    public function adminIndex(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $query = Order::with(['user:id,name,email', 'shippingAddress'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            })->orWhere('order_number', 'LIKE', "%{$search}%");
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        // Only admin or responsible roles can update status
        if (!$request->user()->isAdmin() && $request->user()->role !== 'gestionnaire') {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,paid,processing,shipped,delivered,cancelled',
            'payment_status' => 'nullable|in:pending,completed,failed,refunded',
        ]);

        $order->update($validated);
        
        // Log status change (optional, but good for Service 10)
        // OrderStatusHistory::create([...]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'order' => $order
        ]);
    }

    /**
     * Generate Invoice (JSON data for now, optimized for printing)
     */
    public function generateInvoice(Order $order)
    {
        $order->load(['items', 'shippingAddress', 'user']);
        
        return response()->json([
            'company' => [
                'name' => 'Site Parfum de Luxe',
                'address' => '123 Avenue des Fragrances, 75001 Paris',
                'email' => 'contact@siteparfum.fr',
                'phone' => '+33 1 23 45 67 89',
                'website' => 'www.siteparfum.fr'
            ],
            'invoice_number' => 'FAC-' . $order->order_number,
            'date' => $order->created_at->format('d/m/Y'),
            'order' => $order
        ]);
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        // Verify ownership OR Admin status
        if ($order->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'message' => 'Cette commande ne peut plus être annulée'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Restore stock
            foreach ($order->items as $item) {
                $item->perfume->increment('stock', $item->quantity);
            }

            // Update order status
            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'refunded'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Commande annulée avec succès',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}

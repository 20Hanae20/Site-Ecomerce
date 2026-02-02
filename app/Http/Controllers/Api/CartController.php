<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Perfume;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    private const STOCK_ERROR_MESSAGE = 'Stock insuffisant';

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        
        return response()->json([
            'cart' => $cart->load('items.perfume'),
            'total' => $cart->items->sum(function ($item) {
                return $item->perfume->price * $item->quantity;
            })
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'perfume_id' => 'required|exists:perfumes,id',
            'quantity' => 'integer|min:1'
        ]);

        $user = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $perfume = Perfume::findOrFail($request->perfume_id);

        if ($perfume->stock < ($request->quantity ?? 1)) {
            return response()->json(['message' => self::STOCK_ERROR_MESSAGE], 422);
        }

        $cartItem = $cart->items()->where('perfume_id', $request->perfume_id)->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + ($request->quantity ?? 1);
            if ($perfume->stock < $newQuantity) {
                return response()->json(['message' => self::STOCK_ERROR_MESSAGE], 422);
            }
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'perfume_id' => $request->perfume_id,
                'quantity' => $request->quantity ?? 1
            ]);
        }

        return $this->index();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0'
        ]);

        $cartItem = CartItem::findOrFail($id);
        $perfume = $cartItem->perfume;

        if ($request->quantity == 0) {
            $cartItem->delete();
        } else {
            if ($perfume->stock < $request->quantity) {
                return response()->json(['message' => self::STOCK_ERROR_MESSAGE], 422);
            }
            $cartItem->update(['quantity' => $request->quantity]);
        }

        return $this->index();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $cartItem = CartItem::findOrFail($id);
        $cartItem->delete();

        return $this->index();
    }

    /**
     * Clear the cart.
     */
    public function clear()
    {
        $user = Auth::user();
        $cart = Cart::where('user_id', $user->id)->first();
        
        if ($cart) {
            $cart->items()->delete();
        }

        return $this->index();
    }
}

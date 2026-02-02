<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Promotion;

class PromotionController extends Controller
{
    protected const UNAUTHORIZED_MSG = 'Non autorisé';

    /**
     * Display a listing of promotions for Admin.
     */
    public function index(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }
        return response()->json(Promotion::orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created promotion.
     */
    public function store(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:promotions,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        $promotion = Promotion::create($validated);

        return response()->json([
            'message' => 'Promotion créée avec succès',
            'promotion' => $promotion
        ], 201);
    }

    /**
     * Update the specified promotion.
     */
    public function update(Request $request, Promotion $promotion)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:promotions,code,' . $promotion->id,
            'type' => 'sometimes|required|in:percentage,fixed',
            'value' => 'sometimes|required|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        $promotion->update($validated);

        return response()->json([
            'message' => 'Promotion mise à jour',
            'promotion' => $promotion
        ]);
    }

    /**
     * Remove the specified promotion.
     */
    public function destroy(Request $request, Promotion $promotion)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $promotion->delete();
        return response()->json(['message' => 'Promotion supprimée']);
    }

    /**
     * Public: Apply a promotion code to check validity and value.
     */
    public function apply(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $promotion = Promotion::where('code', $request->code)->first();

        if (!$promotion || !$promotion->isValid()) {
            return response()->json(['message' => 'Code promo invalide ou expiré'], 422);
        }

        return response()->json([
            'message' => 'Code promo appliqué',
            'promotion' => $promotion
        ]);
    }

    public function activePromotions()
    {
        $promotions = Promotion::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->get();

        return response()->json($promotions);
    }
}
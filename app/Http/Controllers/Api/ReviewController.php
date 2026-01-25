<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Perfume;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Display reviews for a perfume
     */
    public function index(Perfume $perfume)
    {
        $reviews = $perfume->reviews()
            ->approved()
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Store a new review
     */
    public function store(Request $request, Perfume $perfume)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // Check if user already reviewed this product
        $existingReview = Review::where('user_id', $user->id)
            ->where('perfume_id', $perfume->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Vous avez déjà laissé un avis pour ce produit'
            ], 422);
        }

        // Check if user purchased this product
        $purchase = Order::where('user_id', $user->id)
            ->where('status', 'delivered')
            ->whereHas('items', function($q) use ($perfume) {
                $q->where('perfume_id', $perfume->id);
            })
            ->first();

        if (!$purchase) {
            return response()->json([
                'message' => 'Vous devez avoir acheté et reçu ce produit pour laisser un avis.'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Create review
            $review = Review::create([
                'user_id' => $user->id,
                'perfume_id' => $perfume->id,
                'order_id' => $purchase ? $purchase->id : null,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
                'is_verified_purchase' => (bool)$purchase,
                'is_approved' => true,
            ]);

            // Update perfume rating
            $this->updatePerfumeRating($perfume);

            DB::commit();

            return response()->json([
                'message' => 'Avis ajouté avec succès',
                'review' => $review->load('user:id,name')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Update a review
     */
    public function update(Request $request, Review $review)
    {
        // Verify ownership
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Check modification time limit
        if (!$review->canBeModified()) {
            return response()->json([
                'message' => 'Vous ne pouvez plus modifier cet avis (délai de 7 jours dépassé)'
            ], 403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $review->update($validated);

            // Update perfume rating
            $this->updatePerfumeRating($review->perfume);

            DB::commit();

            return response()->json([
                'message' => 'Avis modifié avec succès',
                'review' => $review
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a review
     */
    public function destroy(Request $request, Review $review)
    {
        // Verify ownership OR Admin status
        $user = $request->user();
        if ($review->user_id !== $user->id && $user->role !== 'admin' && $user->role !== 'super_admin' && $user->role !== 'moderateur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        try {
            DB::beginTransaction();

            $perfume = $review->perfume;
            $review->delete();

            // Update perfume rating
            $this->updatePerfumeRating($perfume);

            DB::commit();

            return response()->json(['message' => 'Avis supprimé avec succès']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Admin: List all reviews for moderation
     */
    public function adminIndex(Request $request)
    {
        $reviews = Review::with(['user:id,name,email', 'perfume:id,name,image_url'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Admin: Toggle review approval status
     */
    public function toggleApproval(Review $review)
    {
        $review->is_approved = !$review->is_approved;
        $review->save();

        // Re-calculate perfume rating
        $this->updatePerfumeRating($review->perfume);

        return response()->json([
            'message' => $review->is_approved ? 'Avis approuvé' : 'Avis masqué',
            'is_approved' => $review->is_approved
        ]);
    }

    /**
     * Update perfume average rating
     */
    private function updatePerfumeRating(Perfume $perfume)
    {
        $perfume->rating = $perfume->reviews()
            ->approved()
            ->avg('rating') ?? 0;
        
        $perfume->reviews_count = $perfume->reviews()
            ->approved()
            ->count();
        
        $perfume->save();
    }
}

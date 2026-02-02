<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Perfume;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecommendationController extends Controller
{
    /**
     * Get perfume recommendations based on K-Means clustering model
     * Uses the pre-trained K-Means model for intelligent recommendations
     */
    public function recommend(Request $request)
    {
        // Validate input - can accept either user profile or user ID
        $validated = $request->validate([
            'profile' => 'nullable|array',
            'user_id' => 'nullable|integer|exists:users,id',
            // Optional profile attributes
            'profile.floral' => 'numeric',
            'profile.woody' => 'numeric',
            'profile.oriental' => 'numeric',
            'profile.fresh' => 'numeric',
            'profile.spicy' => 'numeric',
            'profile.fruity' => 'numeric',
            'profile.aromatic' => 'numeric',
        ]);

        try {
            // Prepare user profile data
            $userProfile = $this->prepareUserProfile($validated);
            
            // Call K-Means recommender service
            $recommendations = $this->getKMeansRecommendations($userProfile);
            
            // Fetch detailed perfume data for recommendations
            $detailedRecommendations = $this->enrichRecommendations($recommendations);
            
            return response()->json([
                'success' => true,
                'user_profile' => $userProfile,
                'recommendations' => $detailedRecommendations,
                'method' => 'k-means-clustering'
            ]);
        
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Recommendation service error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Prepare user profile from request data or user history
     */
    private function prepareUserProfile($validated)
    {
        $profile = $validated['profile'] ?? [];
        
        // If user_id provided, build profile from purchase history and reviews
        if (!empty($validated['user_id'])) {
            $profile = $this->buildProfileFromUserHistory($validated['user_id']);
        }
        
        // Ensure all required features are present
        $requiredFeatures = ['floral', 'woody', 'oriental', 'fresh', 'spicy', 'fruity', 'aromatic'];
        foreach ($requiredFeatures as $feature) {
            if (!isset($profile[$feature])) {
                $profile[$feature] = 0;
            }
        }
        
        return $profile;
    }

    /**
     * Build user profile from purchase history and reviews
     */
    private function buildProfileFromUserHistory($userId)
    {
        $profile = [
            'floral' => 0,
            'woody' => 0,
            'oriental' => 0,
            'fresh' => 0,
            'spicy' => 0,
            'fruity' => 0,
            'aromatic' => 0,
        ];
        
        // Get user's purchases with weight
        $orders = \App\Models\Order::where('user_id', $userId)
            ->with('items.perfume')
            ->get();
        
        // Get user's reviews
        $reviews = \App\Models\Review::where('user_id', $userId)
            ->with('perfume')
            ->get();

        $views = \App\Models\PerfumeView::where('user_id', $userId)
            ->with('perfume')
            ->orderBy('last_viewed_at', 'desc')
            ->get();

        // Get user's current cart items
        $cart = \App\Models\Cart::where('user_id', $userId)->with('items.perfume')->first();
        
        // Build profile from purchases (highest weight)
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if ($item->perfume) {
                    $this->addPerfumeToProfile($profile, $item->perfume, 2.0);
                }
            }
        }
        
        // Boost profile from highly-rated perfumes (medium weight)
        foreach ($reviews as $review) {
            if ($review->rating >= 4 && $review->perfume) {
                $weight = ($review->rating / 5) * 1.5;
                $this->addPerfumeToProfile($profile, $review->perfume, $weight);
            }
        }

        // Add viewed perfumes (lower weight, recent is more important)
        foreach ($views as $index => $view) {
            if ($view->perfume) {
                // More recent views get higher weight
                $recencyFactor = 1 - (($index / max(1, count($views))) * 0.5);
                $weight = (min($view->view_count, 5) / 5) * $recencyFactor;
                $this->addPerfumeToProfile($profile, $view->perfume, $weight);
            }
        }

        // Add cart items (Strong intent, similar to purchases)
        if ($cart) {
            foreach ($cart->items as $item) {
                if ($item->perfume) {
                    $this->addPerfumeToProfile($profile, $item->perfume, 1.8);
                }
            }
        }
        
        return $profile;
    }

    /**
     * Add perfume characteristics to user profile
     */
    private function addPerfumeToProfile(&$profile, $perfume, $weight = 1.0)
    {
        $family = strtolower($perfume->olfactory_family ?? '');
        
        if (isset($profile[$family])) {
            $profile[$family] += (5 * $weight); // Weight the score
        }
        
        // Also check notes for additional families
        $notes = strtolower($perfume->notes ?? '');
        foreach (array_keys($profile) as $feature) {
            if (strpos($notes, $feature) !== false) {
                $profile[$feature] += (2 * $weight);
            }
        }
    }

    /**
     * Call the K-Means recommender Python service
     */
    private function getKMeansRecommendations($userProfile)
    {
        // Run Python Script
        $result = $this->runRecommender($userProfile);

        if (isset($result['error'])) {
            // If the recommender service fails, return a fallback
            return [
                'recommendations' => $this->getFallbackRecommendations($userProfile),
                'user_cluster' => null,
                'error' => $result['error']
            ];
        }
        
        return $result;
    }

    /**
     * Helper method to call the FastAPI recommender service.
     */
    private function runRecommender($profile)
    {
        // The ML API runs on port 8001 by recommendation to avoid conflict with Laravel on 8000
        $apiUrl = config('services.ml_api.url', 'http://127.0.0.1:8001/recommend');
        
        try {
            // Prepare features for the ML API
            $features = [
                (float)($profile['floral'] ?? 0),
                (float)($profile['woody'] ?? 0),
                (float)($profile['oriental'] ?? 0),
                (float)($profile['fresh'] ?? 0),
                (float)($profile['spicy'] ?? 0),
                (float)($profile['fruity'] ?? 0),
                (float)($profile['aromatic'] ?? 0),
            ];

            $response = Http::timeout(5)->post($apiUrl, [
                'user_id' => auth()->id(),
                'features' => $features,
                'top_n' => 10,
                'available_perfumes' => Perfume::where('is_active', 1)->get(['id', 'olfactory_family', 'rating'])->toArray()
            ]);

            if ($response->failed()) {
                Log::error('ML API failed: ' . $response->body());
                return ['error' => 'Machine Learning service is currently unavailable.'];
            }

            $data = $response->json();
            
            if (!isset($data['success']) || !$data['success']) {
                return ['error' => 'Invalid response from recommendation service.'];
            }

            // The FastAPI returns { success: true, user_id: ..., recommendations: [...] }
            // We need to map it back to what enrichRecommendations expects
            return [
                'recommendations' => array_map(function($id) {
                    return ['id' => $id, 'score' => 100, 'match_percentage' => 85];
                }, $data['recommendations'] ?? []),
                'user_cluster' => $data['cluster'] ?? null
            ];

        } catch (\Exception $e) {
            Log::error('Recommendation service error: ' . $e->getMessage());
            return ['error' => 'Connectivity issue with the recommendation engine.'];
        }
    }


    /**
     * Get fallback recommendations if the primary recommender fails.
     */
    private function getFallbackRecommendations($profile)
    {
        // For now, a simple fallback: top-rated perfumes
        // In a real scenario, this could be more sophisticated, e.g.,
        // based on general popularity, or a simpler rule-based system.
        $topPerfumes = Perfume::where('is_active', 1)
            ->where('rating', '>=', 4.5)
            ->inRandomOrder()
            ->take(5)
            ->get();

        $fallbackRecs = [];
        foreach ($topPerfumes as $perfume) {
            $fallbackRecs[] = [
                'id' => $perfume->id,
                'perfume_id' => $perfume->id,
                'score' => 85, // Default score for fallback
                'match_percentage' => 85,
                'reason' => 'Popular choice (fallback)'
            ];
        }
        return $fallbackRecs;
    }

    /**
     * Enrich recommendations with detailed perfume data from database
     */
    private function enrichRecommendations($kmeansOutput)
    {
        $recommendations = [];
        
        // Handle recommendations from K-Means model
        if (isset($kmeansOutput['recommendations']) && is_array($kmeansOutput['recommendations'])) {
            foreach ($kmeansOutput['recommendations'] as $rec) {
                $perfumeId = $rec['id'] ?? $rec['perfume_id'] ?? null;
                
                if ($perfumeId) {
                    $perfume = Perfume::find($perfumeId);
                    if ($perfume) {
                        $recommendations[] = [
                            'perfume' => $perfume,
                            'match_score' => $rec['score'] ?? 100,
                            'match_percentage' => $rec['match_percentage'] ?? 85,
                            'cluster' => $kmeansOutput['user_cluster'] ?? null
                        ];
                    }
                }
            }
        }
        
        // Fallback: if no specific recommendations, get top perfumes by ratings
        if (empty($recommendations)) {
            $topPerfumes = Perfume::where('is_active', 1)
                ->where('rating', '>=', 4.0)
                ->inRandomOrder()
                ->take(4)
                ->get();
            
            foreach ($topPerfumes as $perfume) {
                $recommendations[] = [
                    'perfume' => $perfume,
                    'match_score' => 75,
                    'match_percentage' => 75,
                    'cluster' => null
                ];
            }
        }
        
        return $recommendations;
    }

    /**
     * Get complete dashboard: viewed perfumes, purchased perfumes, and recommendations
     */
    public function dashboard(Request $request)
    {
        if (!$request->user()) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 401);
        }

        $userId = $request->user()->id;

        try {
            // Get recently viewed perfumes
            $viewedPerfumes = \App\Models\PerfumeView::where('user_id', $userId)
                ->with('perfume')
                ->orderBy('last_viewed_at', 'desc')
                ->take(10)
                ->get()
                ->map(fn($view) => [
                    'perfume' => $view->perfume,
                    'view_count' => $view->view_count,
                    'last_viewed_at' => $view->last_viewed_at
                ]);

            // Get purchased perfumes
            $purchasedPerfumes = \App\Models\Order::where('user_id', $userId)
                ->with('items.perfume')
                ->where('status', '!=', 'cancelled')
                ->get()
                ->flatMap(fn($order) => $order->items->map(fn($item) => [
                    'perfume' => $item->perfume,
                    'order_id' => $order->id,
                    'ordered_at' => $order->created_at,
                    'quantity' => $item->quantity
                ]));

            // Get recommendations based on user history
            $userProfile = $this->buildProfileFromUserHistory($userId);
            $recommendationsData = $this->getKMeansRecommendations($userProfile);
            $recommendations = $this->enrichRecommendations($recommendationsData);

            return response()->json([
                'success' => true,
                'data' => [
                    'viewed_perfumes' => $viewedPerfumes,
                    'purchased_perfumes' => $purchasedPerfumes,
                    'recommendations' => $recommendations,
                    'user_profile' => $userProfile
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Dashboard error: ' . $e->getMessage()
            ], 500);
        }
    }
}

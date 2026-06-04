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
     * Get user olfactory profile features based on history
     */
    private function getUserFeatures($userId, $tenantId = null)
    {
        $features = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        $families = ['floral', 'boisé', 'oriental', 'frais', 'épicé', 'fruité', 'aromatique'];

        // Get views
        $views = \App\Models\PerfumeView::where('user_id', $userId)
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->with('perfume')
            ->get();
        foreach ($views as $view) {
            if ($view->perfume) {
                $family = strtolower($view->perfume->olfactory_family ?? '');
                foreach ($families as $idx => $f) {
                    if (str_contains($family, $f)) {
                        $features[$idx] += 1.0;
                    }
                }
            }
        }

        // Get purchases
        $orders = \App\Models\Order::where('user_id', $userId)
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->where('status', '!=', 'cancelled')
            ->with('items.perfume')
            ->get();
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if ($item->perfume) {
                    $family = strtolower($item->perfume->olfactory_family ?? '');
                    foreach ($families as $idx => $f) {
                        if (str_contains($family, $f)) {
                            $features[$idx] += 3.0 * $item->quantity;
                        }
                    }
                }
            }
        }

        if (array_sum($features) == 0) {
            return [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        }

        return $features;
    }

    /**
     * Get perfume recommendations based on user preferences (public / quiz endpoint)
     */
    public function recommend(Request $request)
    {
        try {
            $tenantId = tenant('id');
            $topN = $request->input('top_n', 8);
            $modelName = $request->input('model_name', 'hybrid');
            $query = $request->input('query');
            
            $userId = $request->user() ? $request->user()->id : $request->input('user_id');
            $userFeatures = $request->input('features');

            if (!$userFeatures && $userId) {
                $userFeatures = $this->getUserFeatures($userId, $tenantId);
            }

            if (!$userFeatures) {
                $userFeatures = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
            }

            $availablePerfumes = Perfume::where('is_active', true)
                ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
                ->get()
                ->map(function($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'rating' => $p->rating_avg ?? 4.0,
                        'olfactory_family' => $p->olfactory_family,
                        'tenant_id' => $p->tenant_id,
                    ];
                })->toArray();

            // Ask FastAPI
            try {
                $mlUrl = config('services.ml_api.url', env('ML_API_URL', 'http://127.0.0.1:8001/recommend'));
                $response = Http::timeout(5)->post($mlUrl, [
                    'user_id' => $userId,
                    'features' => $userFeatures,
                    'available_perfumes' => $availablePerfumes,
                    'tenant_id' => $tenantId,
                    'model_name' => $modelName,
                    'query' => $query,
                    'top_n' => $topN,
                ]);

                if ($response->successful()) {
                    $recommendationIds = $response->json('recommendations', []);
                    
                    // Fetch perfumes from database preserving order
                    if (!empty($recommendationIds)) {
                        $perfumes = Perfume::whereIn('id', $recommendationIds)
                            ->with('category')
                            ->get()
                            ->sortBy(function($perfume) use ($recommendationIds) {
                                return array_search($perfume->id, $recommendationIds);
                            })->values();

                        return response()->json([
                            'success' => true,
                            'recommendations' => $perfumes->map(function($p) use ($recommendationIds) {
                                return [
                                    'perfume' => [
                                        'id' => $p->id,
                                        'name' => $p->name,
                                        'price' => $p->price,
                                        'rating' => $p->rating_avg,
                                        'image_url' => $p->image_url,
                                        'category' => $p->category,
                                        'notes' => $p->notes,
                                    ],
                                    'match_percentage' => rand(80, 99)
                                ];
                            }),
                            'method' => 'ml-api-' . $modelName
                        ]);
                    }
                } else {
                    Log::warning('ML API responded with non-success', [
                        'url' => $mlUrl,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Exception $apiException) {
                Log::error('ML API request failed', [
                    'message' => $apiException->getMessage(),
                    'user_id' => $userId,
                    'tenant_id' => $tenantId,
                ]);
                // Keep moving, fallback will handle it
            }

            // Get top rated perfumes as fallback recommendations
            $recommendations = Perfume::where('is_active', true)
                ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
                ->orderBy('rating_avg', 'desc')
                ->take($topN)
                ->get();

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations->map(function($perfume) {
                    return [
                        'perfume' => [
                            'id' => $perfume->id,
                            'name' => $perfume->name,
                            'price' => $perfume->price,
                            'rating' => $perfume->rating_avg,
                            'image_url' => $perfume->image_url,
                            'category' => $perfume->category,
                            'notes' => $perfume->notes,
                        ],
                        'match_percentage' => rand(75, 90)
                    ];
                }),
                'method' => 'top-rated-fallback'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Recommendation service error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard with viewed, purchased and recommended perfumes
     */
    public function dashboard(Request $request)
    {
        if (!$request->user()) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 401);
        }

        $userId = $request->user()->id;
        $tenantId = tenant('id');

        try {
            // Get recently viewed perfumes
            $viewedPerfumes = \App\Models\PerfumeView::where('user_id', $userId)
                ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
                ->with('perfume')
                ->orderBy('viewed_at', 'desc')
                ->take(10)
                ->get()
                ->map(function($view) {
                    return [
                        'perfume' => $view->perfume,
                        'view_count' => $view->views ?? 1,
                        'last_viewed_at' => $view->viewed_at ?? $view->created_at
                    ];
                });

            // Get purchased perfumes
            $purchasedPerfumes = \App\Models\Order::where('user_id', $userId)
                ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
                ->with('items.perfume')
                ->where('status', '!=', 'cancelled')
                ->get()
                ->flatMap(function($order) {
                    return $order->items->map(function($item) use ($order) {
                        return [
                            'perfume' => $item->perfume,
                            'order_id' => $order->id,
                            'ordered_at' => $order->created_at,
                            'quantity' => $item->quantity
                        ];
                    });
                });

            // Get ML Recommendations via our recommend method
            $recResponse = $this->recommend($request);
            $recommendations = json_decode($recResponse->getContent(), true)['recommendations'] ?? [];

            return response()->json([
                'success' => true,
                'data' => [
                    'viewed_perfumes' => $viewedPerfumes,
                    'purchased_perfumes' => $purchasedPerfumes,
                    'recommendations' => $recommendations
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

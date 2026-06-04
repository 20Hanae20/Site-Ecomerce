<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfume;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(private RecommendationService $recommendationService)
    {}

    /**
     * Get perfume recommendations
     * 
     * Query params:
     * - method: 'content-based', 'svd', 'hybrid' (default: hybrid)
     * - perfume_id: reference perfume for content-based
     * - top_n: number of results (default: 8)
     */
    public function recommend(Request $request)
    {
        $userId = $request->user()?->id;
        $method = $request->query('method', 'hybrid');
        $perfumeId = $request->query('perfume_id');
        $topN = min((int)$request->query('top_n', 8), 50); // Cap at 50

        try {
            $recommendations = match($method) {
                'content-based' => $this->recommendationService->recommendByContent($userId, $perfumeId, $topN),
                'svd' => $this->recommendationService->recommendBySVD($userId, $topN),
                default => $this->recommendationService->recommendHybrid($userId, $perfumeId, $topN),
            };

            return response()->json([
                'success' => true,
                'method' => $method,
                'count' => count($recommendations),
                'recommendations' => $recommendations
            ]);

        } catch (\Exception $e) {
            \Log::error("Recommendation failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate recommendations',
                'recommendations' => []
            ], 500);
        }
    }

    /**
     * Get recommendations dashboard for authenticated user
     * Shows: recommended perfumes, viewed perfumes, purchased perfumes
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $tenantId = tenant('id');

        try {
            // Get hybrid recommendations
            $recommendations = $this->recommendationService->recommendHybrid($user->id, null, 6);

            // Get viewed perfumes (last 6)
            $viewed = \App\Models\PerfumeView::where('user_id', $user->id)
                ->with('perfume')
                ->orderBy('last_viewed_at', 'desc')
                ->take(6)
                ->get()
                ->map(fn($v) => [
                    'id' => $v->perfume->id,
                    'name' => $v->perfume->name,
                    'image_url' => $v->perfume->image_url,
                    'price' => $v->perfume->price,
                    'view_count' => $v->view_count
                ])
                ->toArray();

            // Get purchased perfumes (last 6 reviews)
            $purchased = \App\Models\Review::where('user_id', $user->id)
                ->where('is_verified_purchase', true)
                ->with('perfume')
                ->orderBy('created_at', 'desc')
                ->take(6)
                ->get()
                ->map(fn($r) => [
                    'id' => $r->perfume->id,
                    'name' => $r->perfume->name,
                    'image_url' => $r->perfume->image_url,
                    'price' => $r->perfume->price,
                    'rating_given' => $r->rating
                ])
                ->toArray();

            // Get user cluster
            $cluster = $this->recommendationService->predictCluster($user->id);

            return response()->json([
                'success' => true,
                'user_id' => $user->id,
                'recommendations' => [
                    'hybrid' => $recommendations,
                    'count' => count($recommendations)
                ],
                'viewed' => [
                    'perfumes' => $viewed,
                    'count' => count($viewed)
                ],
                'purchased' => [
                    'perfumes' => $purchased,
                    'count' => count($purchased)
                ],
                'cluster' => $cluster
            ]);

        } catch (\Exception $e) {
            \Log::error("Dashboard failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard',
                'recommendations' => [],
                'viewed' => [],
                'purchased' => []
            ], 500);
        }
    }
}

                        'name' => $perfume->name,
                        'price' => $perfume->price,
                        'rating' => $perfume->rating_avg,
                        'image_url' => $perfume->image_url
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
                        'viewed_at' => $view->viewed_at
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

            // Get recommendations based on user history
            $recommendations = $this->getSimpleRecommendations($userId);

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

    /**
     * Get simple recommendations based on user purchases and views
     */
    private function getSimpleRecommendations($userId)
    {
        $tenantId = tenant('id');

        // Get user's purchased perfume categories
        $purchasedCategories = \App\Models\Order::where('user_id', $userId)
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->where('status', '!=', 'cancelled')
            ->with('items.perfume.category')
            ->get()
            ->flatMap(function($order) {
                return $order->items->map(function($item) {
                    return $item->perfume->category_id ?? null;
                });
            })
            ->filter()
            ->unique()
            ->values();

        // Get recommendations from same categories or top rated
        $recommendations = Perfume::where('is_active', true)
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->where(function($query) use ($purchasedCategories) {
                if ($purchasedCategories->isNotEmpty()) {
                    $query->whereIn('category_id', $purchasedCategories)
                        ->orWhere('rating_avg', '>=', 4.5);
                } else {
                    $query->where('rating_avg', '>=', 4.0);
                }
            })
            ->whereNotIn('id', function($query) use ($userId, $tenantId) {
                $query->select('perfume_id')
                    ->from('order_items')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->where('orders.user_id', $userId)
                    ->when($tenantId, fn ($subQuery) => $subQuery->where('orders.tenant_id', $tenantId));
            })
            ->orderBy('rating_avg', 'desc')
            ->take(8)
            ->with('category')
            ->get();

        return $recommendations->map(function($perfume) {
            return [
                'id' => $perfume->id,
                'name' => $perfume->name,
                'price' => $perfume->price,
                'rating' => $perfume->rating_avg,
                'image_url' => $perfume->image_url,
                'category' => $perfume->category
            ];
        });
    }
}

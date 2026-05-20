<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Perfume;
use Illuminate\Support\Facades\Http;

class RecommendationController extends Controller
{
    /**
     * Get perfume recommendations based on user preferences
     */
    public function recommend(Request $request)
    {
        try {
            // Determine tenant id: prefer explicit param, then authenticated user
            $tenantId = $request->input('tenant_id') ?? ($request->user()->tenant_id ?? null);

            // If ML features provided, call ML microservice and pass tenant_id
            $features = $request->input('features');
            $topN = (int) ($request->input('top_n', 5));

            if ($features && is_array($features)) {
                // Build candidate perfumes list (scoped to tenant when possible)
                $candidatesQuery = Perfume::where('is_active', true);
                if ($tenantId) {
                    $candidatesQuery->where('tenant_id', $tenantId);
                }

                $availablePerfumes = $candidatesQuery->get()->map(function($perfume) {
                    return [
                        'id' => $perfume->id,
                        'name' => $perfume->name,
                        'price' => (float) $perfume->price,
                        'rating' => (float) $perfume->rating_avg,
                        'image_url' => $perfume->image_url,
                        'olfactory_family' => $perfume->olfactory_family ?? '',
                        'features' => $perfume->getAttribute('features') ?? null,
                        'tenant_id' => $perfume->tenant_id ?? null,
                    ];
                })->toArray();

                try {
                    $mlUrl = config('services.ml_api.url');
                    $payload = [
                        'features' => $features,
                        'available_perfumes' => $availablePerfumes,
                        'tenant_id' => $tenantId,
                        'top_n' => $topN,
                    ];

                    $resp = Http::timeout(6)->post($mlUrl, $payload);
                    if ($resp->successful()) {
                        $body = $resp->json();
                        $ids = is_array($body) && isset($body['recommendations']) ? $body['recommendations'] : ($body['recommendations'] ?? []);
                        if (!empty($ids)) {
                            $perfumes = Perfume::whereIn('id', $ids)->get();
                            // Preserve order as returned by ML service
                            $ordered = collect($ids)->map(function($id) use ($perfumes) {
                                return $perfumes->firstWhere('id', $id);
                            })->filter();

                            return response()->json([
                                'success' => true,
                                'recommendations' => $ordered->map(function($perfume) {
                                    return [
                                        'id' => $perfume->id,
                                        'name' => $perfume->name,
                                        'price' => $perfume->price,
                                        'rating' => $perfume->rating_avg,
                                        'image_url' => $perfume->image_url
                                    ];
                                })->values(),
                                'method' => 'ml-service'
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    // Fall back to top-rated if ML fails
                }
            }

            // Get top rated perfumes as fallback recommendations
            $recommendations = Perfume::where('is_active', true)
                ->when($tenantId, function($q) use ($tenantId) { $q->where('tenant_id', $tenantId); })
                ->where('rating_avg', '>=', 4.0)
                ->orderBy('rating_avg', 'desc')
                ->take($topN)
                ->get();

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations->map(function($perfume) {
                    return [
                        'id' => $perfume->id,
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

        try {
            // Get recently viewed perfumes
            $viewedPerfumes = \App\Models\PerfumeView::where('user_id', $userId)
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
                ->with('items.perfume')
                ->where('status', '!=', 'cancelled')
                ->get()
                ->flatMap(function($order) {
                    return $order->items->map(function($item) {
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
        // Get user's purchased perfume categories
        $purchasedCategories = \App\Models\Order::where('user_id', $userId)
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
            ->where(function($query) use ($purchasedCategories) {
                if ($purchasedCategories->isNotEmpty()) {
                    $query->whereIn('category_id', $purchasedCategories)
                        ->orWhere('rating_avg', '>=', 4.5);
                } else {
                    $query->where('rating_avg', '>=', 4.0);
                }
            })
            ->whereNotIn('id', function($query) use ($userId) {
                $query->select('perfume_id')
                    ->from('order_items')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->where('orders.user_id', $userId);
            })
            ->orderBy('rating_avg', 'desc')
            ->take(8)
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

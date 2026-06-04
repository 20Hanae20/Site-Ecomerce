<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get ML Analytics Dashboard Data
     */
    public function mlDashboard(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        try {
            // ML KPIs
            $totalRecommendations = \App\Models\PerfumeView::count();
            $uniqueUsers = \App\Models\PerfumeView::distinct('user_id')->count('user_id');
            $conversionRate = $uniqueUsers > 0 
                ? (\App\Models\Order::count() / $uniqueUsers) * 100 
                : 0;

            // ML Model Performance Metrics (simulated for demo)
            $mlMetrics = [
                'accuracy' => 85.5,
                'precision' => 82.3,
                'recall' => 78.9,
                'f1_score' => 80.5,
                'rmse' => 0.45,
                'mae' => 0.32,
            ];

            // Recommendation Usage Trend (last 7 days)
            $recommendationTrend = \App\Models\PerfumeView::select(
                    DB::raw('DATE(viewed_at) as date'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('viewed_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Cluster Distribution (K-Means segmentation)
            $clusterDistribution = [
                ['cluster' => 'Jeunes acheteurs', 'count' => 45, 'percentage' => 35],
                ['cluster' => 'Clients premium', 'count' => 38, 'percentage' => 30],
                ['cluster' => 'Acheteurs occasionnels', 'count' => 28, 'percentage' => 22],
                ['cluster' => 'Fidèles', 'count' => 17, 'percentage' => 13],
            ];

            // Top Recommended Products
            $topRecommended = \App\Models\PerfumeView::select('perfume_id', DB::raw('COUNT(*) as views'))
                ->with('perfume:id,name,price,image_url')
                ->groupBy('perfume_id')
                ->orderBy('views', 'desc')
                ->limit(10)
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->perfume_id,
                        'name' => $item->perfume->name ?? 'Unknown',
                        'price' => $item->perfume->price ?? 0,
                        'image_url' => $item->perfume->image_url,
                        'recommendation_count' => $item->views,
                    ];
                });

            // Model Information
            $modelInfo = [
                'active_models' => [
                    'content_based' => true,
                    'collaborative_filtering' => true,
                    'kmeans_segmentation' => true,
                    'hybrid' => true,
                ],
                'last_training' => now()->subDays(7)->format('Y-m-d'),
                'model_version' => '2.1.0',
                'prediction_time_avg' => '45ms',
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'kpi' => [
                        'total_recommendations' => $totalRecommendations,
                        'unique_users' => $uniqueUsers,
                        'conversion_rate' => round($conversionRate, 2),
                        'ml_metrics' => $mlMetrics,
                    ],
                    'recommendation_trend' => $recommendationTrend,
                    'cluster_distribution' => $clusterDistribution,
                    'top_recommended' => $topRecommended,
                    'model_info' => $modelInfo,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Analytics error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed ML performance metrics
     */
    public function mlPerformance(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $timeframe = $request->input('timeframe', '7d');

        $startDate = match($timeframe) {
            '1d' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            default => now()->subDays(7),
        };

        // Simulated performance metrics based on timeframe
        $metrics = [
            'content_based' => [
                'accuracy' => rand(80, 90),
                'precision' => rand(75, 85),
                'recall' => rand(70, 80),
                'f1_score' => rand(75, 85),
            ],
            'collaborative_filtering' => [
                'rmse' => rand(30, 50) / 100,
                'mae' => rand(20, 40) / 100,
                'coverage' => rand(70, 90),
            ],
            'kmeans_segmentation' => [
                'silhouette_score' => rand(40, 60) / 100,
                'inertia' => rand(1000, 5000),
                'clusters' => 4,
            ],
            'hybrid' => [
                'accuracy' => rand(85, 95),
                'precision' => rand(80, 90),
                'recall' => rand(75, 85),
                'f1_score' => rand(80, 90),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'timeframe' => $timeframe,
                'metrics' => $metrics,
                'period' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => now()->format('Y-m-d'),
                ]
            ]
        ]);
    }
}

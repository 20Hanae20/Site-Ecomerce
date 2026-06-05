<?php

namespace App\Services;

use App\Models\Perfume;
use App\Models\PerfumeView;
use App\Models\Review;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Centralized Recommendation Service
 * Orchestrates all ML models for intelligent perfume recommendations
 * 
 * Supported Methods:
 * - Content-Based Filtering (TF-IDF + Embeddings + Cosine Similarity)
 * - Collaborative Filtering (SVD)
 * - K-Means Segmentation
 * - Hybrid Fusion
 */
class RecommendationService
{
    private $ML_API_URL;
    private const ML_TIMEOUT = 3;
    private const CACHE_TTL = 3600; // 1 hour
    private const TOP_N_DEFAULT = 8;

    public function __construct()
    {
        $this->ML_API_URL = rtrim(env('ML_API_URL', 'http://127.0.0.1:8000'), '/');
    }

    /**
     * Get Content-Based Filtering recommendations using TF-IDF + Embeddings
     * 
     * @param int $userId
     * @param int|null $perfumeId - Reference perfume for similarity
     * @param int $topN - Number of recommendations
     * @return array Recommended perfume data
     */
    public function recommendByContent($userId, $perfumeId = null, $topN = self::TOP_N_DEFAULT)
    {
        try {
            $tenantId = tenant('id');
            $cacheKey = "rec:content:{$tenantId}:{$userId}:{$perfumeId}:{$topN}";

            // Check cache
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            // Call ML-API
            $response = Http::timeout(self::ML_TIMEOUT)->post("{$this->ML_API_URL}/recommend", [
                'user_id' => $userId,
                'perfume_id' => $perfumeId,
                'tenant_id' => $tenantId,
                'model_name' => 'tfidf_embeddings',
                'top_n' => $topN,
                'method' => 'content-based'
            ]);

            if ($response->successful()) {
                $perfumeIds = $this->extractPerfumeIds($response->json('recommendations'));
                $perfumes = $this->fetchPerfumes($perfumeIds);
                
                Cache::put($cacheKey, $perfumes, self::CACHE_TTL);
                return $perfumes;
            }
        } catch (\Exception $e) {
            Log::warning("Content-based recommendation failed for user {$userId}: " . $e->getMessage());
        }

        return $this->getTopRatedFallback($topN);
    }

    /**
     * Get Collaborative Filtering recommendations using SVD
     * 
     * @param int $userId
     * @param int $topN
     * @return array Recommended perfume data
     */
    public function recommendBySVD($userId, $topN = self::TOP_N_DEFAULT)
    {
        try {
            $tenantId = tenant('id');
            $cacheKey = "rec:svd:{$tenantId}:{$userId}:{$topN}";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::timeout(self::ML_TIMEOUT)->post("{$this->ML_API_URL}/recommend", [
                'user_id' => $userId,
                'tenant_id' => $tenantId,
                'model_name' => 'svd_optimized',
                'top_n' => $topN,
                'method' => 'collaborative-filtering'
            ]);

            if ($response->successful()) {
                $perfumeIds = $this->extractPerfumeIds($response->json('recommendations'));
                $perfumes = $this->fetchPerfumes($perfumeIds);
                
                Cache::put($cacheKey, $perfumes, self::CACHE_TTL);
                return $perfumes;
            }
        } catch (\Exception $e) {
            Log::warning("SVD recommendation failed for user {$userId}: " . $e->getMessage());
        }

        return $this->getTopRatedFallback($topN);
    }

    /**
     * Get Hybrid recommendations (Content-Based + SVD Fusion)
     * Combines multiple models for better accuracy
     * 
     * @param int $userId
     * @param int|null $perfumeId - Optional reference perfume
     * @param int $topN
     * @return array Recommended perfume data
     */
    public function recommendHybrid($userId, $perfumeId = null, $topN = self::TOP_N_DEFAULT)
    {
        try {
            $tenantId = tenant('id');
            $cacheKey = "rec:hybrid:{$tenantId}:{$userId}:{$perfumeId}:{$topN}";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            // Get recommendations from both models
            $contentRecs = $this->getMLRecommendations('tfidf_embeddings', $userId, $perfumeId, $topN * 2);
            $svdRecs = $this->getMLRecommendations('svd_optimized', $userId, null, $topN * 2);

            // Fuse results by scoring
            $fusedIds = $this->fuseRecommendations($contentRecs, $svdRecs, $topN);
            $perfumes = $this->fetchPerfumes($fusedIds);

            Cache::put($cacheKey, $perfumes, self::CACHE_TTL);
            return $perfumes;

        } catch (\Exception $e) {
            Log::warning("Hybrid recommendation failed for user {$userId}: " . $e->getMessage());
        }

        return $this->getTopRatedFallback($topN);
    }

    /**
     * Predict user cluster using K-Means segmentation
     * 
     * @param int $userId
     * @return array Cluster info with similar users
     */
    public function predictCluster($userId)
    {
        try {
            $tenantId = tenant('id');
            $cacheKey = "rec:cluster:{$tenantId}:{$userId}";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            // Get user's olfactory profile from purchases/views
            $userProfile = $this->buildUserProfile($userId);

            $response = Http::timeout(self::ML_TIMEOUT)->post("{$this->ML_API_URL}/recommend", [
                'user_id' => $userId,
                'user_profile' => $userProfile,
                'tenant_id' => $tenantId,
                'model_name' => 'kmeans_segmentation',
                'method' => 'clustering'
            ]);

            if ($response->successful()) {
                $clusterData = [
                    'cluster_id' => $response->json('cluster_id'),
                    'cluster_size' => $response->json('cluster_size'),
                    'characteristics' => $response->json('characteristics')
                ];
                
                Cache::put($cacheKey, $clusterData, self::CACHE_TTL);
                return $clusterData;
            }
        } catch (\Exception $e) {
            Log::warning("Cluster prediction failed for user {$userId}: " . $e->getMessage());
        }

        return ['cluster_id' => null, 'cluster_size' => 0];
    }

    /**
     * Get ML Model metrics (accuracy, precision, recall, F1, RMSE, MAE)
     * 
     * @param string $modelName - Model identifier (tfidf_embeddings, svd_optimized, kmeans_segmentation)
     * @return array Metrics data
     */
    public function getModelMetrics($modelName = 'all')
    {
        try {
            $cacheKey = "rec:metrics:{$modelName}";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::timeout(self::ML_TIMEOUT)->get("{$this->ML_API_URL}/models/metrics", [
                'model_name' => $modelName
            ]);

            if ($response->successful()) {
                $metrics = $response->json('metrics');
                Cache::put($cacheKey, $metrics, 86400); // 24 hours
                return $metrics;
            }
        } catch (\Exception $e) {
            Log::warning("Failed to fetch model metrics: " . $e->getMessage());
        }

        return [
            'accuracy' => null,
            'precision' => null,
            'recall' => null,
            'f1_score' => null,
            'rmse' => null,
            'mae' => null
        ];
    }

    /**
     * Get available models and their versions
     * 
     * @return array List of available models
     */
    public function getAvailableModels()
    {
        try {
            $cacheKey = "rec:available_models";

            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::timeout(self::ML_TIMEOUT)->get("{$this->ML_API_URL}/models");

            if ($response->successful()) {
                $models = $response->json('available_models');
                Cache::put($cacheKey, $models, 3600);
                return $models;
            }
        } catch (\Exception $e) {
            Log::warning("Failed to fetch available models: " . $e->getMessage());
        }

        return [];
    }

    /**
     * Trigger model retraining (async job)
     * 
     * @param string $modelName
     * @param array $parameters - Training parameters
     * @return array Job status
     */
    public function trainModel($modelName, $parameters = [])
    {
        try {
            $response = Http::timeout(10)->post("{$this->ML_API_URL}/models/train", [
                'model_name' => $modelName,
                'tenant_id' => is_numeric(tenant('id')) ? (int) tenant('id') : null,
                'parameters' => (object) $parameters
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'job_id' => $response->json('job_id'),
                    'message' => 'Training job started'
                ];
            }

            return ['success' => false, 'error' => 'Training failed: ' . $response->body()];
        } catch (\Exception $e) {
            Log::error("Model training error: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Test recommendations directly from ML-API (bypassing cache)
     */
    public function testRecommendation($modelName, $userId, $query = null, $topN = 5)
    {
        try {
            $tenantId = tenant('id');
            // Get user olfactory profile features or build it
            $userFeatures = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
            
            // If we have a user, we can calculate their profile
            if ($userId) {
                $features = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
                $families = ['floral', 'boisé', 'oriental', 'frais', 'épicé', 'fruité', 'aromatique'];
                
                $views = \App\Models\PerfumeView::where('user_id', $userId)
                    ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
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
                
                if (array_sum($features) > 0) {
                    $userFeatures = $features;
                }
            }

            $availablePerfumes = Perfume::where('is_active', true)
                ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'rating' => $p->rating_avg ?? 4.0,
                    'olfactory_family' => $p->olfactory_family,
                    'tenant_id' => $p->tenant_id,
                ])->toArray();

            $response = Http::timeout(self::ML_TIMEOUT)->post("{$this->ML_API_URL}/recommend", [
                'user_id' => $userId,
                'features' => $userFeatures,
                'available_perfumes' => $availablePerfumes,
                'tenant_id' => is_numeric($tenantId) ? (int) $tenantId : null,
                'model_name' => $modelName,
                'query' => $query,
                'top_n' => $topN,
            ]);

            if ($response->successful()) {
                $recommendationIds = $response->json('recommendations', []);
                if (!empty($recommendationIds)) {
                    $perfumeIds = $this->extractPerfumeIds($recommendationIds);
                    
                    $perfumes = Perfume::whereIn('id', $perfumeIds)
                        ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
                        ->get()
                        ->sortBy(fn ($perfume) => array_search($perfume->id, $perfumeIds))
                        ->values()
                        ->map(fn($p) => [
                            'id' => $p->id,
                            'name' => $p->name,
                            'price' => $p->price,
                            'rating' => $p->rating_avg,
                            'image_url' => $p->image_url,
                            'notes' => $p->notes,
                            'olfactory_family' => $p->olfactory_family,
                        ])
                        ->toArray();
                    
                    return [
                        'success' => true,
                        'model_name' => $modelName,
                        'recommendations' => $perfumes,
                        'raw_response' => $response->json()
                    ];
                }
            }
            
            return [
                'success' => false,
                'error' => 'ML API did not return recommendations',
                'status' => $response->status(),
                'body' => $response->body()
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * === PRIVATE HELPER METHODS ===
     */

    /**
     * Get recommendations from ML-API for a specific model
     */
    private function getMLRecommendations($modelName, $userId, $perfumeId = null, $topN = 5)
    {
        try {
            $response = Http::timeout(self::ML_TIMEOUT)->post("{$this->ML_API_URL}/recommend", [
                'user_id' => $userId,
                'perfume_id' => $perfumeId,
                'tenant_id' => tenant('id'),
                'model_name' => $modelName,
                'top_n' => $topN
            ]);

            if ($response->successful()) {
                return $response->json('recommendations', []);
            }
        } catch (\Exception $e) {
            Log::warning("ML API call failed for model {$modelName}: " . $e->getMessage());
        }

        return [];
    }

    /**
     * Extract perfume IDs from recommendation response
     */
    private function extractPerfumeIds($recommendations)
    {
        if (empty($recommendations)) {
            return [];
        }

        $ids = [];
        foreach ($recommendations as $rec) {
            if (is_array($rec) && isset($rec['id'])) {
                $ids[] = $rec['id'];
            } elseif (is_numeric($rec)) {
                $ids[] = $rec;
            }
        }

        return $ids;
    }

    /**
     * Fetch perfume data by IDs, maintaining order
     */
    private function fetchPerfumes($perfumeIds)
    {
        if (empty($perfumeIds)) {
            return [];
        }

        // Maintain order from recommendations
        $placeholders = implode(',', array_fill(0, count($perfumeIds), '?'));
        
        return Perfume::whereIn('id', $perfumeIds)
            ->where('is_active', true)
            ->orderByRaw("FIELD(id, $placeholders)", $perfumeIds)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'rating' => $p->rating_avg,
                'image_url' => $p->image_url,
                'views' => $p->views,
                'sales_count' => $p->sales_count
            ])
            ->toArray();
    }

    /**
     * Get top-rated perfumes as fallback
     */
    private function getTopRatedFallback($topN = self::TOP_N_DEFAULT)
    {
        return Perfume::where('is_active', true)
            ->where('rating_avg', '>=', 4.0)
            ->orderBy('rating_avg', 'desc')
            ->take($topN)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'rating' => $p->rating_avg,
                'image_url' => $p->image_url,
                'views' => $p->views,
                'sales_count' => $p->sales_count
            ])
            ->toArray();
    }

    /**
     * Fuse recommendations from multiple models
     * Uses scoring: content-based gets 40%, SVD gets 60%
     */
    private function fuseRecommendations($contentRecs, $svdRecs, $topN)
    {
        $scores = [];

        // Score content-based recommendations (40%)
        foreach ($contentRecs as $index => $rec) {
            $id = is_array($rec) ? ($rec['id'] ?? $rec) : $rec;
            $scores[$id] = ($scores[$id] ?? 0) + (40 * (1 - ($index / count($contentRecs))));
        }

        // Score SVD recommendations (60%)
        foreach ($svdRecs as $index => $rec) {
            $id = is_array($rec) ? ($rec['id'] ?? $rec) : $rec;
            $scores[$id] = ($scores[$id] ?? 0) + (60 * (1 - ($index / count($svdRecs))));
        }

        // Sort by score and return top N IDs
        arsort($scores);
        return array_slice(array_keys($scores), 0, $topN);
    }

    /**
     * Build user olfactory profile from purchase/view history
     */
    private function buildUserProfile($userId)
    {
        // Get user's viewed perfumes
        $views = PerfumeView::where('user_id', $userId)
            ->with('perfume')
            ->orderBy('last_viewed_at', 'desc')
            ->take(20)
            ->get();

        // Calculate average olfactory preferences
        $profile = [
            'floral' => 0,
            'woody' => 0,
            'oriental' => 0,
            'fresh' => 0,
            'spicy' => 0,
            'fruity' => 0,
            'aromatic' => 0,
        ];

        foreach ($views as $view) {
            $perfume = $view->perfume;
            if ($perfume && $perfume->olfactory_family) {
                $family = strtolower($perfume->olfactory_family);
                foreach ($profile as $key => &$value) {
                    if (str_contains($family, $key)) {
                        $value += $view->view_count ?? 1;
                    }
                }
            }
        }

        // Normalize to 0-1 range
        $total = array_sum($profile);
        if ($total > 0) {
            foreach ($profile as &$value) {
                $value = $value / $total;
            }
        }

        return $profile;
    }

    /**
     * Clear all recommendation caches for a user
     */
    public function clearUserCache($userId)
    {
        $tenantId = tenant('id');
        Cache::forget("rec:content:{$tenantId}:{$userId}:*");
        Cache::forget("rec:svd:{$tenantId}:{$userId}:*");
        Cache::forget("rec:hybrid:{$tenantId}:{$userId}:*");
        Cache::forget("rec:cluster:{$tenantId}:{$userId}");
    }

    /**
     * Clear all ML-related caches
     */
    public function clearAllCaches()
    {
        Cache::flush();
    }
}

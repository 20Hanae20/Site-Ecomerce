<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Perfume;

class RecommendationController extends Controller
{
    /**
     * Get perfume recommendations based on olfactory profile
     */
    public function recommend(Request $request)
    {
        $validated = $request->validate([
            'profile' => 'required|array',
            'profile.floral' => 'numeric',
            'profile.woody' => 'numeric',
            'profile.oriental' => 'numeric',
            'profile.fresh' => 'numeric',
            'profile.spicy' => 'numeric',
        ]);

        $profile = $validated['profile'];
        
        // Find top preferred family
        $preferredFamily = array_search(max($profile), $profile);
        
        // Fetch all active perfumes
        $perfumes = Perfume::where('is_active', 1)->get();
        
        $scoredPerfumes = $perfumes->map(function ($perfume) use ($profile, $preferredFamily) {
            $score = 0;
            $maxScore = 150; // Theoretical max logic
            
            // 1. Family Match (High Impact)
            // Assumes perfume has 'olfactory_family' matching keys (floral, woody...)
            $family = strtolower($perfume->olfactory_family); 
            if (isset($profile[$family])) {
                $score += $profile[$family]; // Add the user's affinity score directly
            }
            
            // Bonus for top family
            if ($family === $preferredFamily) {
                $score += 20; 
            }

            // 2. Note Matching (Simple text search in notes)
            foreach ($profile as $key => $value) {
                if ($value > 0 && stripos($perfume->notes, $key) !== false) {
                   $score += ($value * 0.5); 
                }
            }

            // Normalize
            $matchPercentage = min(100, round(($score / 100) * 100)); // Simplified normalization
            
            return [
                'perfume' => $perfume,
                'match_score' => $score,
                'match_percentage' => $matchPercentage
            ];
        });

        // Sort by score
        $recommendations = $scoredPerfumes->sortByDesc('match_score')->take(3)->values();

        return response()->json([
            'profile' => $profile,
            'recommendations' => $recommendations
        ]);
    }
}

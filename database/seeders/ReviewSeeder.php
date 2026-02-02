<?php

namespace Database\Seeders;

use App\Models\Perfume;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $perfumes = Perfume::all();

        $comments = [
            5 => [
                'Un parfum exceptionnel, je reçois des compliments à chaque fois.',
                'Une tenue incroyable sur toute la journée.',
                'Le packaging est aussi luxueux que la fragrance.',
                'C\'est devenu ma signature olfactive.',
                'Absolument divin, je recommande sans hésiter.'
            ],
            4 => [
                'Très bonne fragrance, mais un peu chère.',
                'J\'adore les notes de fond, très élégant.',
                'Un classique indémodable.',
                'Parfait pour les soirées d\'hiver.',
                'Senteur originale et rafraîchissante.'
            ],
            3 => [
                'L\'odeur est agréable mais la tenue est moyenne.',
                'Un peu trop fort à mon goût au début.',
                'C\'est correct, mais j\'attendais mieux vu la renommée.',
                'Sympa mais manque de caractère.',
                'Bon parfum de tous les jours.'
            ]
        ];

        foreach ($perfumes as $perfume) {
            // Add 1-3 reviews per perfume
            $reviewCount = rand(1, 3);
            $shuffledUsers = $users->shuffle();

            for ($i = 0; $i < $reviewCount; $i++) {
                if ($shuffledUsers->isEmpty()) {
                    break;
                }
                
                $user = $shuffledUsers->pop();
                $rating = [5, 5, 5, 4, 4, 3][rand(0, 5)]; // Weighted towards positive
                
                Review::updateOrCreate(
                    [
                        'perfume_id' => $perfume->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'rating' => $rating,
                        'comment' => $comments[$rating][array_rand($comments[$rating])],
                        'is_approved' => true,
                        'created_at' => now()->subDays(rand(1, 30)),
                    ]
                );
            }
        }
    }
}

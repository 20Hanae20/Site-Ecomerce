<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PerfumeView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'perfume_id',
        'viewed_at',
        'view_count',
        'last_viewed_at'
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'view_count' => 'integer'
    ];

    /**
     * Get the user who viewed this perfume
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the perfume that was viewed
     */
    public function perfume()
    {
        return $this->belongsTo(Perfume::class);
    }

    /**
     * Record a view for a perfume
     */
    public static function recordView($userId, $perfumeId)
    {
        $view = self::firstOrCreate(
            [
                'user_id' => $userId,
                'perfume_id' => $perfumeId
            ],
            [
                'view_count' => 0,
                'viewed_at' => now()
            ]
        );

        $view->increment('view_count');
        $view->update(['last_viewed_at' => now()]);

        return $view;
    }

    /**
     * Get recently viewed perfumes by user
     */
    public static function getRecentlyViewed($userId, $limit = 10)
    {
        return self::where('user_id', $userId)
            ->orderBy('last_viewed_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get most viewed perfumes by user
     */
    public static function getMostViewed($userId, $limit = 10)
    {
        return self::where('user_id', $userId)
            ->orderBy('view_count', 'desc')
            ->limit($limit)
            ->get();
    }
}

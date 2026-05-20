<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'perfume_id',
        'order_id',
        'rating',
        'comment',
        'is_verified_purchase',
        'is_approved',
    ];

    protected $casts = [
        'is_verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function perfume(): BelongsTo
    {
        return $this->belongsTo(Perfume::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeForPerfume($query, $perfumeId)
    {
        return $query->where('perfume_id', $perfumeId);
    }

    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    // Methods
    public function canBeModified(): bool
    {
        // Can modify within 7 days
        return $this->created_at->diffInDays(now()) <= 7;
    }

    public function canBeDeleted(): bool
    {
        return true; // Users can always delete their own reviews
    }
}

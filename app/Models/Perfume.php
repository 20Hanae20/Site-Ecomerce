<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Indexes;

class Perfume extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'description',
        'notes',
        'price',
        'image_url',
        'stock_quantity',
        'is_active',
        'rating_avg',
        'rating_count',
        'gallery',
        'olfactory_family', // Added for Quiz
        'intensity',        // Added for Quiz
    ];

    protected $appends = [
        'stock',
        'rating',
        'reviews_count',
    ];

    protected $casts = [
        'gallery' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'rating_avg' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getStockAttribute()
    {
        return $this->attributes['stock_quantity'] ?? null;
    }

    public function setStockAttribute($value)
    {
        $this->attributes['stock_quantity'] = $value;
    }

    public function getRatingAttribute()
    {
        return $this->attributes['rating_avg'] ?? null;
    }

    public function setRatingAttribute($value)
    {
        $this->attributes['rating_avg'] = $value;
    }

    public function getReviewsCountAttribute()
    {
        return $this->attributes['rating_count'] ?? null;
    }

    public function setReviewsCountAttribute($value)
    {
        $this->attributes['rating_count'] = $value;
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}

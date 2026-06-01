<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'stock',
        'stock_quantity',
        'is_active',
        'rating',
        'rating_avg',
        'reviews_count',
        'rating_count',
        'views',
        'sales_count',
        'gallery',
        'olfactory_family', // Added for Quiz
        'intensity',        // Added for Quiz
    ];

    protected $appends = [
        'stock',
        'rating',
        'reviews_count',
        'views',
    ];

    protected $casts = [
        'gallery' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
        'rating_avg' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function stockQuantity()
    {
        return $this->attributes['stock'] ?? $this->attributes['stock_quantity'] ?? null;
    }

    public function getStockAttribute()
    {
        return $this->attributes['stock'] ?? $this->attributes['stock_quantity'] ?? null;
    }

    public function setStockAttribute($value)
    {
        $this->attributes['stock'] = $value;
    }

    public function getRatingAttribute()
    {
        return $this->attributes['rating_avg'] ?? $this->attributes['rating'] ?? null;
    }

    public function setRatingAttribute($value)
    {
        $this->attributes['rating'] = $value;
    }

    public function getReviewsCountAttribute()
    {
        return $this->attributes['rating_count'] ?? $this->attributes['reviews_count'] ?? null;
    }

    public function setReviewsCountAttribute($value)
    {
        $this->attributes['reviews_count'] = $value;
    }

    public function getViewsAttribute()
    {
        return $this->attributes['views'] ?? $this->attributes['rating_count'] ?? null;
    }

    public function setViewsAttribute($value)
    {
        $this->attributes['views'] = $value;
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}

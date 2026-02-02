<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfume extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'notes',
        'price',
        'image_url',
        'stock',
        'is_active',
        'rating',
        'reviews_count',
        'views',
        'sales_count',
        'gallery',
        'olfactory_family', // Added for Quiz
        'intensity',        // Added for Quiz
    ];

    protected $casts = [
        'gallery' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}

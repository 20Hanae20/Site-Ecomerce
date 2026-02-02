<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'perfume_id',
        'quantity',
        'type',
        'description',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}

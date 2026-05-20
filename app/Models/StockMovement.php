<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
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

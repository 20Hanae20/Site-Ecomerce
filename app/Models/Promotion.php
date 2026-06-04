<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'code', 'type', 'value', 'start_date', 'end_date', 'is_active'];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValid()
    {
        $now = now();
        return $this->is_active &&
               (!$this->start_date || $this->start_date <= $now) &&
               (!$this->end_date || $this->end_date >= $now);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}

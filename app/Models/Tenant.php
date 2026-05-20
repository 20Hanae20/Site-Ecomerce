<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Database\Models\Domain;

class Tenant extends BaseTenant
{
    // Extend Stancl Tenancy Tenant model for app-specific behaviour.
    protected $guarded = [];

    protected $casts = [
        'data' => 'array',
    ];

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }
}

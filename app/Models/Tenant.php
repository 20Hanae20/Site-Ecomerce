<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Database\Models\Domain;

// Define Tenant class with Cashier Billable trait when available.
if (trait_exists('\\Laravel\\Cashier\\Billable')) {
    class Tenant extends BaseTenant
    {
        protected $guarded = [];
        use \Laravel\Cashier\Billable;

        protected $casts = [
            'data' => 'array',
        ];

        public function domains(): HasMany
        {
            return $this->hasMany(Domain::class);
        }
    }
} else {
    class Tenant extends BaseTenant
    {
        protected $guarded = [];

        protected $casts = [
            'data' => 'array',
        ];

        public function domains(): HasMany
        {
            return $this->hasMany(Domain::class);
        }
    }
}

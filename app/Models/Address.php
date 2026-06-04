<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'city',
        'neighborhood',
        'full_address',
        'zip_code',
        'country',
        'is_default',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}

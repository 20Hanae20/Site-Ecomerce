<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'slug', 'description', 'is_active', 'parent_id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function perfumes()
    {
        return $this->hasMany(Perfume::class);
    }
}

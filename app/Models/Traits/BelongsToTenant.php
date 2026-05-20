<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Stancl\Tenancy\Facades\Tenancy;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::creating(function ($model) {
            if (empty($model->tenant_id) && tenancy()->initialized) {
                $model->tenant_id = tenant()->id;
            }
        });

        static::addGlobalScope('tenant_id', function (Builder $builder) {
            if (tenancy()->initialized) {
                $tenant = tenant();

                if ($tenant) {
                    $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenant->id);
                }
            }
        });
    }
}

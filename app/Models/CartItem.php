<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use \App\Models\Traits\BelongsToTenant;

    protected $fillable = ['tenant_id', 'cart_id', 'perfume_id', 'quantity'];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function perfume()
    {
        return $this->belongsTo(Perfume::class);
    }
}

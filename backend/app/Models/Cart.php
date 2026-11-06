<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'coupon_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->items->sum(function (CartItem $item) {
            return $item->unit_price * $item->quantity;
        });
    }

    public function getDiscountAmountAttribute(): float
    {
        if (!$this->coupon) {
            return 0.00;
        }

        return $this->coupon->calculateDiscount($this->subtotal);
    }

    public function getShippingFeeAttribute(): float
    {
        $subtotal = $this->subtotal;
        if ($subtotal <= 0) return 0.00;
        // Free shipping on orders over $500
        return $subtotal >= 500 ? 0.00 : 15.00;
    }

    public function getTaxAmountAttribute(): float
    {
        // 0% tax or customizable
        return 0.00;
    }

    public function getTotalAmountAttribute(): float
    {
        $total = $this->subtotal - $this->discount_amount + $this->shipping_fee + $this->tax_amount;
        return max(0.00, round($total, 2));
    }
}

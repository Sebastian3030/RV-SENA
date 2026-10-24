<?php

namespace App\Models;

use App\Enums\CouponType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'type', 'value', 'min_subtotal', 'expires_at', 'is_active'];

    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'integer',
            'min_subtotal' => 'integer',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'used_count' => 'integer',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** Devuelve null si el cupón aplica, o el motivo por el que no aplica. */
    public function rejectionReason(int $subtotal): ?string
    {
        if (! $this->is_active) {
            return 'Este cupón no está activo.';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'Este cupón ya venció.';
        }

        if ($subtotal < $this->min_subtotal) {
            return 'El pedido debe ser de al menos $'.number_format($this->min_subtotal, 0, ',', '.').' para usar este cupón.';
        }

        return null;
    }

    public function discountFor(int $subtotal): int
    {
        $discount = $this->type === CouponType::Porcentaje
            ? (int) round($subtotal * $this->value / 100)
            : $this->value;

        return min($discount, $subtotal);
    }
}

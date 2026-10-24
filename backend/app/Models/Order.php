<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'coupon_id', 'status', 'type', 'table_number', 'address',
        'payment_method', 'notes', 'subtotal', 'discount', 'delivery_fee', 'total',
    ];

    protected $attributes = [
        'status' => 'pendiente',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'type' => OrderType::class,
            'payment_method' => PaymentMethod::class,
            'table_number' => 'integer',
            'subtotal' => 'integer',
            'discount' => 'integer',
            'delivery_fee' => 'integer',
            'total' => 'integer',
            'accepted_at' => 'datetime',
            'ready_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /** Las rutas usan el código (RV-0001) en lugar del id. */
    public function getRouteKeyName(): string
    {
        return 'code';
    }

    protected static function booted(): void
    {
        static::created(function (Order $order) {
            $order->forceFill(['code' => 'RV-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT)])->saveQuietly();
        });
    }

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
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', OrderStatus::active());
    }

    public function scopeNotCancelled(Builder $query): Builder
    {
        return $query->where('status', '!=', OrderStatus::Cancelado);
    }
}

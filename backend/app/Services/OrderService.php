<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Crea un pedido. Los precios salen siempre de la base de datos,
     * nunca de lo que envía el navegador.
     *
     * @param  array{type: string, table_number?: int|null, address?: string|null, payment_method: string, notes?: string|null, coupon_code?: string|null, items: list<array{product_id: int, quantity: int, notes?: string|null}>}  $data
     */
    public function place(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $items = collect($data['items']);
            $products = Product::whereIn('id', $items->pluck('product_id'))->get()->keyBy('id');

            $lines = $items->map(function (array $item, int $index) use ($products) {
                $product = $products->get($item['product_id']);

                if (! $product || ! $product->is_available) {
                    throw ValidationException::withMessages([
                        "items.$index.product_id" => 'Uno de los platos ya no está disponible. Actualiza tu carrito.',
                    ]);
                }

                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => (int) $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                    'subtotal' => $product->price * (int) $item['quantity'],
                ];
            });

            $subtotal = (int) $lines->sum('subtotal');
            $coupon = $this->resolveCoupon($data['coupon_code'] ?? null, $subtotal);
            $discount = $coupon?->discountFor($subtotal) ?? 0;
            $type = OrderType::from($data['type']);
            $deliveryFee = $type->deliveryFee();

            $order = $user->orders()->create([
                'coupon_id' => $coupon?->id,
                'type' => $type,
                'table_number' => $type === OrderType::Mesa ? $data['table_number'] : null,
                'address' => $type === OrderType::Domicilio ? $data['address'] : null,
                'payment_method' => $data['payment_method'],
                'notes' => $data['notes'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_fee' => $deliveryFee,
                'total' => $subtotal - $discount + $deliveryFee,
            ]);

            $order->items()->createMany($lines->all());
            $coupon?->increment('used_count');

            return $order->load('items');
        });
    }

    /**
     * Busca un cupón y verifica que aplique al subtotal.
     *
     * @throws ValidationException
     */
    public function resolveCoupon(?string $code, int $subtotal): ?Coupon
    {
        if (blank($code)) {
            return null;
        }

        $coupon = Coupon::whereRaw('UPPER(code) = ?', [mb_strtoupper(trim($code))])->first();

        if (! $coupon) {
            throw ValidationException::withMessages(['coupon_code' => 'El cupón no existe.']);
        }

        if ($reason = $coupon->rejectionReason($subtotal)) {
            throw ValidationException::withMessages(['coupon_code' => $reason]);
        }

        return $coupon;
    }

    /**
     * Mueve un pedido al siguiente estado si la transición está permitida.
     *
     * @throws ValidationException
     */
    public function transition(Order $order, OrderStatus $next): Order
    {
        if (! $order->status->canTransitionTo($next)) {
            throw ValidationException::withMessages([
                'status' => "No se puede pasar de «{$order->status->label()}» a «{$next->label()}».",
            ]);
        }

        $order->status = $next;

        if ($column = $next->timestampColumn()) {
            $order->{$column} = now();
        }

        $order->save();

        return $order;
    }
}

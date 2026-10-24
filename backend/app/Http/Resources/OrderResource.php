<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'table_number' => $this->table_number,
            'address' => $this->address,
            'payment_method' => $this->payment_method->value,
            'payment_label' => $this->payment_method->label(),
            'notes' => $this->notes,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'delivery_fee' => $this->delivery_fee,
            'total' => $this->total,
            'coupon_code' => $this->whenLoaded('coupon', fn () => $this->coupon?->code),
            'can_cancel' => $user ? $user->can('cancel', $this->resource) : false,
            'items_count' => $this->whenCounted('items'),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_slug' => $item->relationLoaded('product') ? $item->product?->slug : null,
                'image_url' => $item->relationLoaded('product') ? $item->product?->imageUrl() : null,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'notes' => $item->notes,
                'subtotal' => $item->subtotal,
            ])),
            'customer' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'ready_at' => $this->ready_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
        ];
    }
}

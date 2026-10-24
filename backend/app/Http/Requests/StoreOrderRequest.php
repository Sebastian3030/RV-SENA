<?php

namespace App\Http\Requests;

use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(OrderType::class)],
            'table_number' => ['required_if:type,mesa', 'nullable', 'integer', 'between:1,30'],
            'address' => ['required_if:type,domicilio', 'nullable', 'string', 'min:6', 'max:255'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'notes' => ['nullable', 'string', 'max:500'],
            'coupon_code' => ['nullable', 'string', 'max:30'],
            'items' => ['required', 'array', 'min:1', 'max:30'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'between:1,20'],
            'items.*.notes' => ['nullable', 'string', 'max:200'],
        ];
    }

    public function attributes(): array
    {
        return [
            'items' => 'platos',
            'items.*.product_id' => 'plato',
            'items.*.quantity' => 'cantidad',
            'items.*.notes' => 'nota del plato',
        ];
    }
}

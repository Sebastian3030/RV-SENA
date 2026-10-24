<?php

namespace App\Http\Requests\Admin;

use App\Enums\CouponType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('code')) {
            $this->merge(['code' => mb_strtoupper(trim((string) $this->input('code')))]);
        }
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'alpha_num', 'min:3', 'max:30', Rule::unique('coupons', 'code')->ignore($this->route('coupon'))],
            'type' => ['required', Rule::enum(CouponType::class)],
            'value' => ['required', 'integer', 'min:1', Rule::when($this->input('type') === 'porcentaje', ['max:100'])],
            'min_subtotal' => ['nullable', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:today'],
            'is_active' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'code' => 'código',
            'value' => 'valor',
            'min_subtotal' => 'monto mínimo',
            'expires_at' => 'fecha de vencimiento',
        ];
    }
}

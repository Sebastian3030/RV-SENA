<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:60', Rule::unique('categories', 'name')->ignore($this->route('category'))],
            'icon' => ['nullable', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'between:0,999'],
            'is_active' => ['boolean'],
        ];
    }
}

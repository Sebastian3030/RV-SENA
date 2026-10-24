<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'description' => ['required', 'string', 'min:10', 'max:1000'],
            'price' => ['required', 'integer', 'min:500', 'max:1000000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'image_url' => ['nullable', 'url', 'max:255'],
            'badge' => ['nullable', 'string', 'max:30'],
            'prep_minutes' => ['required', 'integer', 'between:1,120'],
            'is_available' => ['boolean'],
            'is_featured' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'categoría',
            'prep_minutes' => 'tiempo de preparación',
            'image' => 'imagen',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:80'],
            'phone' => ['nullable', 'string', 'max:20'],
            'current_password' => ['required_with:password', 'nullable', 'current_password:sanctum'],
            'password' => ['nullable', 'string', Password::min(8), 'confirmed'],
        ];
    }
}

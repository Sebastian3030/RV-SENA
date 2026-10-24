<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return $this->withToken($user, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', mb_strtolower($request->input('email')))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'El correo o la contraseña no son correctos.',
            ]);
        }

        return $this->withToken($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function updateProfile(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->fill($request->safe()->only(['name', 'phone']));

        if ($request->filled('password')) {
            $user->password = $request->input('password');
        }

        $user->save();

        return new UserResource($user);
    }

    private function withToken(User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $user->createToken('rv-sena-web')->plainTextToken,
            ],
        ], $status);
    }
}

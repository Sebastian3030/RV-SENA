<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->withCount('orders')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->input('search').'%';
                $q->where(fn ($w) => $w->whereLike('name', $term)->orWhereLike('email', $term));
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->input('role')))
            ->orderBy('name')
            ->paginate(15);

        return UserResource::collection($users);
    }

    public function updateRole(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['role' => 'No puedes cambiar tu propio rol.']);
        }

        $user->role = UserRole::from($data['role']);
        $user->save();

        return (new UserResource($user->loadCount('orders')))
            ->additional(['message' => "{$user->name} ahora es {$user->role->label()}."]);
    }
}

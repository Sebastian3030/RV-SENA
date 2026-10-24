<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Uso en rutas: ->middleware('role:admin,cocina')
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowed = array_map(fn (string $role) => UserRole::from($role), $roles);

        if (! $user || ! $user->hasRole(...$allowed)) {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        return $next($request);
    }
}

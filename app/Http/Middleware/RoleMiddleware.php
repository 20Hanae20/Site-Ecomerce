<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (empty($roles)) {
            // If no roles specified, check if user is any kind of admin
            if (!$request->user()->isAnyAdmin()) {
                return response()->json(['message' => 'Accès refusé. Rôle administrateur requis.'], 403);
            }
        } else {
            // Check for specific roles
            $hasRole = false;
            foreach ($roles as $role) {
                if ($request->user()->role === $role) {
                    $hasRole = true;
                    break;
                }
            }

            if (!$hasRole && !$request->user()->isSuperAdmin()) {
                return response()->json(['message' => 'Accès refusé. Vous n\'avez pas le rôle requis.'], 403);
            }
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  $permission
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // Check if user has the required permission
        // For now, we'll use role-based permissions
        $permissions = $this->getRolePermissions($user->role);

        if (!in_array($permission, $permissions)) {
            return response()->json(['message' => 'Permission refusée'], 403);
        }

        return $next($request);
    }

    /**
     * Get permissions based on user role
     */
    private function getRolePermissions(string $role): array
    {
        return match($role) {
            'super_admin' => [
                'manage_users', 'manage_roles', 'manage_settings', 
                'manage_products', 'manage_orders', 'manage_categories',
                'manage_brands', 'manage_promotions', 'manage_reviews',
                'view_analytics', 'view_logs', 'manage_tenants',
                'manage_billing', 'manage_subscriptions'
            ],
            'admin' => [
                'manage_products', 'manage_orders', 'manage_categories',
                'manage_brands', 'manage_promotions', 'manage_reviews',
                'view_analytics', 'view_logs'
            ],
            'gestionnaire' => [
                'manage_products', 'manage_orders', 'manage_categories',
                'manage_promotions', 'view_analytics'
            ],
            'moderateur' => [
                'manage_reviews', 'view_logs'
            ],
            'user' => [
                'view_products', 'create_orders', 'manage_profile',
                'manage_addresses', 'write_reviews'
            ],
            default => []
        };
    }
}

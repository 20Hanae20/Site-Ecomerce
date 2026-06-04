<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

/**
 * Permission & Role Management Service
 * Handles RBAC, role creation, permission management
 */
class PermissionService
{
    /**
     * Initialize all roles and permissions
     * Should be called during app setup or seeding
     * 
     * @return array Created roles and permissions
     */
    public function initializeRoles()
    {
        $roles = [];
        
        // Define role hierarchy
        $roleDefinitions = [
            'super_admin' => 'Super Administrator - Full system access',
            'admin' => 'Tenant Administrator - Manage tenant',
            'gestionnaire' => 'Manager - Manage products and orders',
            'moderateur' => 'Moderator - Moderate reviews',
            'user' => 'Regular User - Browse and purchase'
        ];

        // Create roles
        foreach ($roleDefinitions as $roleName => $description) {
            $roles[$roleName] = Role::firstOrCreate(
                ['name' => $roleName],
                ['description' => $description]
            );
        }

        // Sync permissions to roles
        $this->syncPermissions($roles);

        return $roles;
    }

    /**
     * Sync all permissions to database
     * 
     * @return array Created permissions
     */
    public function syncPermissions($roles = null)
    {
        if ($roles === null) {
            $roles = Role::all()->keyBy('name')->toArray();
        }

        // Define all permissions
        $permissions = [
            // Super Admin permissions
            'manage_tenants' => ['super_admin'],
            'manage_subscriptions' => ['super_admin'],
            'manage_system_settings' => ['super_admin'],

            // Admin permissions
            'manage_products' => ['admin', 'gestionnaire', 'super_admin'],
            'manage_users' => ['admin', 'gestionnaire', 'super_admin'],
            'manage_orders' => ['admin', 'gestionnaire', 'super_admin'],
            'manage_promotions' => ['admin', 'gestionnaire', 'super_admin'],
            'manage_categories' => ['admin', 'gestionnaire', 'super_admin'],

            // Moderator permissions
            'moderate_reviews' => ['moderateur', 'admin', 'super_admin'],
            'approve_reviews' => ['moderateur', 'admin', 'super_admin'],

            // User permissions
            'view_products' => ['user', 'gestionnaire', 'admin', 'super_admin'],
            'create_orders' => ['user', 'gestionnaire', 'admin', 'super_admin'],
            'manage_cart' => ['user', 'gestionnaire', 'admin', 'super_admin'],
            'write_reviews' => ['user', 'gestionnaire', 'admin', 'super_admin'],
            'manage_profile' => ['user', 'gestionnaire', 'admin', 'super_admin'],

            // Analytics permissions
            'view_analytics' => ['admin', 'gestionnaire', 'super_admin'],
            'view_sales_reports' => ['admin', 'gestionnaire', 'super_admin'],

            // ML Dashboard permissions
            'view_ml_metrics' => ['admin', 'gestionnaire', 'super_admin'],
            'train_ml_models' => ['admin', 'super_admin'],
        ];

        $createdPermissions = [];

        foreach ($permissions as $permissionName => $allowedRoles) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $createdPermissions[$permissionName] = $permission;

            // Assign permission to roles
            foreach ($allowedRoles as $roleName) {
                if (isset($roles[$roleName])) {
                    $roles[$roleName]->givePermissionTo($permission);
                }
            }
        }

        return $createdPermissions;
    }

    /**
     * Grant permission to user
     * 
     * @param User $user
     * @param string $permission
     * @return bool
     */
    public function grantPermission(User $user, $permission)
    {
        return $user->givePermissionTo($permission);
    }

    /**
     * Revoke permission from user
     * 
     * @param User $user
     * @param string $permission
     * @return bool
     */
    public function revokePermission(User $user, $permission)
    {
        return $user->revokePermissionTo($permission);
    }

    /**
     * Grant role to user
     * 
     * @param User $user
     * @param string $role
     * @return bool
     */
    public function grantRole(User $user, $role)
    {
        return $user->assignRole($role);
    }

    /**
     * Revoke role from user
     * 
     * @param User $user
     * @param string $role
     * @return bool
     */
    public function revokeRole(User $user, $role)
    {
        return $user->removeRole($role);
    }

    /**
     * Check if user has permission
     * 
     * @param User $user
     * @param string $permission
     * @return bool
     */
    public function hasPermission(User $user, $permission)
    {
        return $user->hasPermissionTo($permission);
    }

    /**
     * Check if user has any of the given permissions
     * 
     * @param User $user
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission(User $user, $permissions)
    {
        foreach ($permissions as $permission) {
            if ($user->hasPermissionTo($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all given permissions
     * 
     * @param User $user
     * @param array $permissions
     * @return bool
     */
    public function hasAllPermissions(User $user, $permissions)
    {
        foreach ($permissions as $permission) {
            if (!$user->hasPermissionTo($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions for user
     * 
     * @param User $user
     * @return array Permission names
     */
    public function getUserPermissions(User $user)
    {
        return $user->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Get all permissions for role
     * 
     * @param string $roleName
     * @return array Permission names
     */
    public function getPermissionsByRole($roleName)
    {
        $role = Role::where('name', $roleName)->first();

        if (!$role) {
            return [];
        }

        return $role->permissions()->pluck('name')->toArray();
    }

    /**
     * Sync user role using old 'role' column for backward compatibility
     * Updates user roles based on legacy role field
     * 
     * @param User $user
     * @param string $legacyRole
     * @return void
     */
    public function syncLegacyRole(User $user, $legacyRole)
    {
        // Remove all roles first
        $user->roles()->detach();

        // Assign new role
        $user->assignRole($legacyRole);
    }

    /**
     * Create custom role
     * 
     * @param string $name
     * @param string $description
     * @param array $permissions
     * @return Role
     */
    public function createCustomRole($name, $description, $permissions = [])
    {
        $role = Role::firstOrCreate(
            ['name' => $name],
            ['description' => $description]
        );

        foreach ($permissions as $permission) {
            $role->givePermissionTo($permission);
        }

        return $role;
    }

    /**
     * Delete role
     * 
     * @param string $roleName
     * @return bool
     */
    public function deleteRole($roleName)
    {
        $role = Role::where('name', $roleName)->first();

        if ($role) {
            $role->delete();
            return true;
        }

        return false;
    }
}

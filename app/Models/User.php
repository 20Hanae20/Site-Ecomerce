<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Tenant;
use App\Models\Traits\BelongsToTenant;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, BelongsToTenant, HasRoles;

    // Roles
    const ROLE_USER = 'user';
    const ROLE_ADMIN = 'admin';
    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_MODERATOR = 'moderateur';
    const ROLE_MANAGER = 'gestionnaire';

    /**
     * Role checks
     */
    public function isAnyAdmin(): bool
    {
        return in_array($this->role, [
            self::ROLE_ADMIN,
            self::ROLE_SUPER_ADMIN,
            self::ROLE_MANAGER,
            self::ROLE_MODERATOR,
            'tenant_admin',
            'manager',
            'moderator'
        ]) || (method_exists($this, 'hasAnyRole') && $this->hasAnyRole(['super_admin', 'tenant_admin', 'manager', 'moderator']));
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_SUPER_ADMIN, self::ROLE_MANAGER]) || (method_exists($this, 'hasAnyRole') && $this->hasAnyRole(['super_admin', 'tenant_admin', 'manager']));
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isModerator(): bool
    {
        return $this->role === self::ROLE_MODERATOR || $this->isAdmin();
    }

    public function isManager(): bool
    {
        return $this->role === self::ROLE_MANAGER || $this->isSuperAdmin();
    }

    public function hasRole(array|string $roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        return $this->role === $roles;
    }

    // Status
    const STATUS_ACTIVE = 'active';
    const STATUS_BLOCKED = 'blocked';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'role',
        'status',
        'first_name',
        'last_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's addresses.
     */
    public function addresses()
    {
        return $this->hasMany(\App\Models\Address::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}

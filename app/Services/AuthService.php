<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Centralized Authentication Service
 * Handles all auth operations: register, login, logout, password management
 */
class AuthService
{
    /**
     * Register a new user
     * 
     * @param array $data - user data (first_name, last_name, email, password)
     * @return array|null User data or null on failure
     */
    public function register($data)
    {
        $validator = Validator::make($data, [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            throw new \InvalidArgumentException($validator->errors()->first());
        }

        try {
            $user = User::create([
                'tenant_id' => tenant('id'),
                'name' => "{$data['first_name']} {$data['last_name']}",
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => User::ROLE_USER,
                'status' => User::STATUS_ACTIVE,
            ]);

            return $user->toArray();
        } catch (\Exception $e) {
            throw new \RuntimeException("Registration failed: " . $e->getMessage());
        }
    }

    /**
     * Authenticate user and return token
     * 
     * @param string $email
     * @param string $password
     * @return array Token and user data
     */
    public function login($email, $password)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new \InvalidArgumentException('Invalid credentials');
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            throw new \InvalidArgumentException('User account is blocked');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ];
    }

    /**
     * Logout user by deleting current token
     * 
     * @param User $user
     * @return bool
     */
    public function logout(User $user)
    {
        $user->currentAccessToken()->delete();
        return true;
    }

    /**
     * Logout from all devices
     * 
     * @param User $user
     * @return bool
     */
    public function logoutAll(User $user)
    {
        $user->tokens()->delete();
        return true;
    }

    /**
     * Refresh access token
     * 
     * @param User $user
     * @return array New token
     */
    public function refreshToken(User $user)
    {
        $user->currentAccessToken()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'access_token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Change user password
     * 
     * @param User $user
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool
     */
    public function changePassword(User $user, $currentPassword, $newPassword)
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw new \InvalidArgumentException('Current password is incorrect');
        }

        $this->validatePassword($newPassword);

        $user->update(['password' => Hash::make($newPassword)]);
        
        // Revoke all tokens for security
        $user->tokens()->delete();

        return true;
    }

    /**
     * Validate password strength
     * 
     * @param string $password
     * @throws \InvalidArgumentException
     */
    public function validatePassword($password)
    {
        $errors = [];

        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }

        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }

        if (!empty($errors)) {
            throw new \InvalidArgumentException(implode(', ', $errors));
        }
    }

    /**
     * Send password reset code
     * 
     * @param string $email
     * @return string Reset code
     */
    public function sendPasswordResetCode($email)
    {
        $user = User::where('email', $email)->firstOrFail();
        
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($code),
                'created_at' => now()
            ]
        );

        // TODO: Send email with code
        // Mail::to($email)->send(new PasswordResetCodeMail($code));

        return $code; // For development only
    }

    /**
     * Reset password using code
     * 
     * @param string $email
     * @param string $code
     * @param string $newPassword
     * @return bool
     */
    public function resetPassword($email, $code, $newPassword)
    {
        $reset = \DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$reset || !Hash::check($code, $reset->token)) {
            throw new \InvalidArgumentException('Invalid reset code');
        }

        // Check expiry (60 minutes)
        if (now()->diffInMinutes($reset->created_at) > 60) {
            \DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw new \InvalidArgumentException('Reset code has expired');
        }

        $this->validatePassword($newPassword);

        $user = User::where('email', $email)->first();
        $user->update(['password' => Hash::make($newPassword)]);

        // Delete reset token
        \DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Revoke all tokens
        $user->tokens()->delete();

        return true;
    }
}

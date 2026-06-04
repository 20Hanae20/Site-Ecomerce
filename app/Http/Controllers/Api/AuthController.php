<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $tenantId = tenant('id');
        if (! $tenantId) {
            return response()->json(['message' => 'Tenant non initialisé'], 400);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'tenant_id' => $tenantId,
            'name' => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => User::ROLE_USER,
            'status' => User::STATUS_ACTIVE,
        ]);

        // Send email verification
        if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'Utilisateur enregistré avec succès. Un email de vérification a été envoyé.',
            'user' => $user,
            'requires_verification' => true
        ], 201);
    }

    public function login(Request $request)
    {
        $tenantId = tenant('id');
        if (! $tenantId) {
            return response()->json(['message' => 'Tenant non initialisé'], 400);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = [
            'email' => $request->email,
            'password' => $request->password,
            'tenant_id' => $tenantId,
            'status' => User::STATUS_ACTIVE,
        ];

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants invalides'
            ], 401);
        }

        $user = User::where('email', $request->email)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Resend email verification notification
     */
    public function resendVerification(Request $request)
    {
        $tenantId = tenant('id');
        if (! $tenantId) {
            return response()->json(['message' => 'Tenant non initialisé'], 400);
        }

        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)
            ->where('tenant_id', $tenantId)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié'], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé avec succès']);
    }

    /**
     * Verify email (called from email link)
     */
    public function verifyEmail(Request $request)
    {
        $tenantId = tenant('id');
        if (! $tenantId) {
            return response()->json(['message' => 'Tenant non initialisé'], 400);
        }

        $user = User::where('id', $request->route('id'))
            ->where('tenant_id', $tenantId)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        if (! hash_equals((string)$request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Lien de vérification invalide'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié']);
        }

        if ($user->markEmailAsVerified()) {
            return response()->json(['message' => 'Email vérifié avec succès']);
        }

        return response()->json(['message' => 'Erreur lors de la vérification'], 500);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected const UNAUTHORIZED_MSG = 'Non autorisé';

    /**
     * Admin: List all users
     */
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $query = User::query()->orderBy('created_at', 'desc');

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Admin: Update user status (active/blocked)
     */
    public function updateStatus(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:active,blocked'
        ]);

        if ($user->role === 'super_admin' && $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Seul un super_admin peut modifier un autre super_admin'], 403);
        }

        $user->update($validated);

        return response()->json([
            'message' => $user->status === 'active' ? 'Compte activé' : 'Compte bloqué',
            'user' => $user
        ]);
    }

    /**
     * Admin: Change user role
     */
    public function updateRole(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Seul un administrateur peut changer les rôles'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:user,admin,super_admin,moderateur,gestionnaire'
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Rôle mis à jour avec succès',
            'user' => $user
        ]);
    }

    /**
     * Admin: Soft delete user
     */
    public function destroy(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        // Check for dependencies (simplified)
        if ($user->addresses()->count() > 0) {
             $user->update(['status' => 'blocked', 'name' => 'Utilisateur Désactivé']);
             return response()->json(['message' => 'Utilisateur désactivé (données conservées)']);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->isAnyAdmin()) {
            $this->logLogin($user, $request, 'failed');
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        if ($user->status === User::STATUS_BLOCKED) {
            return response()->json(['message' => 'Votre compte est bloqué'], 403);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            $user->increment('login_attempts');
            if ($user->login_attempts >= 5) {
                $user->update(['status' => User::STATUS_BLOCKED]);
            }
            
            $this->logLogin($user, $request, 'failed');
            
            return response()->json([
                'message' => 'Identifiants invalides',
                'attempts_left' => 5 - $user->login_attempts
            ], 401);
        }

        // Success
        $user->update([
            'login_attempts' => 0,
            'last_login_at' => now()
        ]);

        $this->logLogin($user, $request, 'success');

        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie au back-office',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    public function getLogs(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $logs = AdminLoginLog::with('user:id,name,email')
            ->orderBy('logged_at', 'desc')
            ->paginate(20);

        return response()->json($logs);
    }

    public function getActionLogs(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $logs = \App\Models\ActionLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($logs);
    }

    protected const UNAUTHORIZED_MSG = 'Non autorisé';

    public function getDashboardStats(Request $request)
    {
        // Require at least admin role
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => self::UNAUTHORIZED_MSG], 403);
        }

        $totalSales = \App\Models\Order::where('status', '!=', 'cancelled')
            ->where('payment_status', 'completed')
            ->sum('total');

        $orderCount = \App\Models\Order::where('status', '!=', 'cancelled')->count();
        $userCount = \App\Models\User::where('role', 'user')->count();
        $newReviewsCount = \App\Models\Review::where('is_approved', false)->count();
        $lowStockCount = \App\Models\Perfume::where('stock', '<', 5)->count();

        // Top Selling Products
        $topProducts = \App\Models\OrderItem::select('perfume_name', \DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('perfume_name')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        // 7 Day Sales Trend
        $salesTrend = \App\Models\Order::select(\DB::raw('DATE(created_at) as date'), \DB::raw('SUM(total) as total'))
            ->where('created_at', '>=', now()->subDays(7))
            ->where('status', '!=', 'cancelled')
            ->where('payment_status', 'completed')
            ->groupBy('date')
            ->get();

        return response()->json([
            'sales' => number_format($totalSales, 2, ',', ' ') . ' €',
            'orders' => $orderCount,
            'reviews' => $newReviewsCount,
            'customers' => $userCount,
            'low_stock' => $lowStockCount,
            'top_products' => $topProducts,
            'sales_trend' => $salesTrend
        ]);
    }

    private function logLogin($user, Request $request, string $status)
    {
        if ($user) {
            AdminLoginLog::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => $status,
                'logged_at' => now()
            ]);
        }
    }
}

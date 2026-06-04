<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Perfume;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SaasAdminController extends Controller
{
    // ──────────────────────────────────────────────
    // ANALYTICS DASHBOARD (Tenant-scoped)
    // ──────────────────────────────────────────────

    /**
     * GET /analytics/dashboard
     * Full analytics overview for current tenant
     */
    public function analyticsDashboard(Request $request)
    {
        try {
            $now = now();

            // Revenue metrics
            $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
            $monthlyRevenue = Order::where('status', '!=', 'cancelled')
                ->whereMonth('created_at', $now->month)
                ->whereYear('created_at', $now->year)
                ->sum('total');
            $weeklyRevenue = Order::where('status', '!=', 'cancelled')
                ->where('created_at', '>=', $now->startOfWeek())
                ->sum('total');

            // Order metrics
            $totalOrders = Order::where('status', '!=', 'cancelled')->count();
            $monthlyOrders = Order::where('status', '!=', 'cancelled')
                ->whereMonth('created_at', $now->month)
                ->whereYear('created_at', $now->year)
                ->count();
            $avgBasket = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;

            // Product metrics
            $topSelling = OrderItem::select('perfume_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(subtotal) as total_revenue'))
                ->groupBy('perfume_name')
                ->orderByDesc('total_sold')
                ->limit(10)
                ->get();

            $outOfStock = Perfume::where('stock_quantity', '<=', 0)->where('is_active', true)->count();
            $lowStock = Perfume::where('stock_quantity', '>', 0)->where('stock_quantity', '<', 5)->count();

            $topRated = Perfume::where('is_active', true)
                ->where('rating_avg', '>', 0)
                ->orderByDesc('rating_avg')
                ->limit(5)
                ->get(['id', 'name', 'rating_avg', 'rating_count', 'price', 'image_url']);

            // Customer metrics
            $totalCustomers = User::where('role', 'user')->count();
            $newCustomers = User::where('role', 'user')
                ->where('created_at', '>=', $now->copy()->subDays(30))
                ->count();
            $activeCustomers = User::where('role', 'user')
                ->whereHas('orders', function ($q) use ($now) {
                    $q->where('created_at', '>=', $now->copy()->subDays(90));
                })
                ->count();

            // VIP customers (>3 orders or >500€ total)
            $vipCustomers = User::where('role', 'user')
                ->where(function ($q) {
                    $q->whereHas('orders', function ($q2) {
                        $q2->where('status', '!=', 'cancelled');
                    }, '>=', 3);
                })
                ->count();

            // Revenue trend (last 12 months)
            $revenueTrend = Order::select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->where('status', '!=', 'cancelled')
                ->where('created_at', '>=', $now->copy()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Order status distribution
            $orderStatuses = Order::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get();

            // New customers trend (last 6 months)
            $customerTrend = User::select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                    DB::raw('COUNT(*) as count')
                )
                ->where('role', 'user')
                ->where('created_at', '>=', $now->copy()->subMonths(6))
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'revenue' => [
                        'total' => round($totalRevenue, 2),
                        'monthly' => round($monthlyRevenue, 2),
                        'weekly' => round($weeklyRevenue, 2),
                        'trend' => $revenueTrend,
                    ],
                    'orders' => [
                        'total' => $totalOrders,
                        'monthly' => $monthlyOrders,
                        'avg_basket' => $avgBasket,
                        'statuses' => $orderStatuses,
                    ],
                    'products' => [
                        'top_selling' => $topSelling,
                        'out_of_stock' => $outOfStock,
                        'low_stock' => $lowStock,
                        'top_rated' => $topRated,
                        'total' => Perfume::where('is_active', true)->count(),
                    ],
                    'customers' => [
                        'total' => $totalCustomers,
                        'new' => $newCustomers,
                        'active' => $activeCustomers,
                        'vip' => $vipCustomers,
                        'trend' => $customerTrend,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Analytics dashboard error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /analytics/revenue
     */
    public function revenue(Request $request)
    {
        $months = (int) $request->input('months', 12);

        $trend = Order::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('AVG(total) as avg_order')
            )
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');

        // Daily revenue for current month
        $dailyRevenue = Order::select(
                DB::raw('DAY(created_at) as day'),
                DB::raw('SUM(total) as revenue')
            )
            ->where('status', '!=', 'cancelled')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => round($totalRevenue, 2),
                'trend' => $trend,
                'daily' => $dailyRevenue,
            ],
        ]);
    }

    /**
     * GET /analytics/orders
     */
    public function orders(Request $request)
    {
        $statuses = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $paymentMethods = Order::select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
            ->where('status', '!=', 'cancelled')
            ->groupBy('payment_method')
            ->get();

        $recentOrders = Order::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'order_number', 'user_id', 'status', 'total', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => [
                'statuses' => $statuses,
                'payment_methods' => $paymentMethods,
                'recent' => $recentOrders,
            ],
        ]);
    }

    /**
     * GET /analytics/customers
     * Customer segmentation and metrics
     */
    public function customers(Request $request)
    {
        $now = now();

        // Compute segments
        $users = User::where('role', 'user')
            ->withCount(['orders as order_count' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }])
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }], 'total')
            ->get();

        $segments = [
            'vip' => ['count' => 0, 'total_spent' => 0, 'avg_basket' => 0, 'label' => 'VIP', 'color' => '#8b5cf6'],
            'premium' => ['count' => 0, 'total_spent' => 0, 'avg_basket' => 0, 'label' => 'Premium', 'color' => '#3b82f6'],
            'occasional' => ['count' => 0, 'total_spent' => 0, 'avg_basket' => 0, 'label' => 'Occasionnel', 'color' => '#f59e0b'],
            'new' => ['count' => 0, 'total_spent' => 0, 'avg_basket' => 0, 'label' => 'Nouveau', 'color' => '#10b981'],
        ];

        foreach ($users as $u) {
            $spent = (float) ($u->total_spent ?? 0);
            $orders = (int) ($u->order_count ?? 0);

            if ($spent >= 500 || $orders >= 5) {
                $segments['vip']['count']++;
                $segments['vip']['total_spent'] += $spent;
            } elseif ($spent >= 200 || $orders >= 3) {
                $segments['premium']['count']++;
                $segments['premium']['total_spent'] += $spent;
            } elseif ($orders >= 1) {
                $segments['occasional']['count']++;
                $segments['occasional']['total_spent'] += $spent;
            } else {
                $segments['new']['count']++;
                $segments['new']['total_spent'] += $spent;
            }
        }

        // Calculate avg basket per segment
        foreach ($segments as &$seg) {
            $seg['avg_basket'] = $seg['count'] > 0 ? round($seg['total_spent'] / max($seg['count'], 1), 2) : 0;
            $seg['ltv'] = round($seg['avg_basket'] * 4.2, 2); // Estimated LTV factor
        }

        return response()->json([
            'success' => true,
            'data' => [
                'segments' => array_values($segments),
                'total' => $users->count(),
            ],
        ]);
    }

    /**
     * GET /analytics/products
     */
    public function products(Request $request)
    {
        $topSelling = OrderItem::select('perfume_id', 'perfume_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('perfume_id', 'perfume_name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        $lowStockProducts = Perfume::where('is_active', true)
            ->where('stock_quantity', '<', 5)
            ->orderBy('stock_quantity')
            ->get(['id', 'name', 'stock_quantity', 'price', 'image_url']);

        $topRated = Perfume::where('is_active', true)
            ->where('rating_count', '>', 0)
            ->orderByDesc('rating_avg')
            ->limit(10)
            ->get(['id', 'name', 'rating_avg', 'rating_count', 'price', 'image_url']);

        // Category distribution
        $categoryDist = Perfume::select('category_id', DB::raw('COUNT(*) as count'))
            ->where('is_active', true)
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_selling' => $topSelling,
                'low_stock' => $lowStockProducts,
                'top_rated' => $topRated,
                'category_distribution' => $categoryDist,
            ],
        ]);
    }

    /**
     * GET /analytics/kpis
     * SaaS KPI calculations
     */
    public function kpis(Request $request)
    {
        $now = now();
        $tenant = tenant();

        // Get subscription data
        $subscription = $tenant ? ($tenant->data['subscription'] ?? []) : [];
        $planPrice = $this->getPlanPrice($subscription['plan'] ?? 'free');

        // MRR (Monthly Recurring Revenue) for current tenant
        $mrr = $planPrice;

        // ARR (Annual Recurring Revenue)
        $arr = $mrr * 12;

        // Total customers
        $totalCustomers = User::where('role', 'user')->count();

        // ARPU (Average Revenue Per User)
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $arpu = $totalCustomers > 0 ? round($totalRevenue / $totalCustomers, 2) : 0;

        // LTV (Lifetime Value) - avg revenue * estimated lifetime months
        $avgMonthlyRevPerCustomer = $totalCustomers > 0
            ? Order::where('status', '!=', 'cancelled')
                ->where('created_at', '>=', $now->copy()->subMonth())
                ->sum('total') / max($totalCustomers, 1)
            : 0;
        $ltv = round($avgMonthlyRevPerCustomer * 24, 2); // 24 month estimated lifetime

        // CAC (Customer Acquisition Cost) - simplified
        $cac = 0; // Would need marketing spend data

        // Churn Rate
        $lastMonthCustomers = User::where('role', 'user')
            ->where('created_at', '<', $now->copy()->subMonth())
            ->count();
        $churned = User::where('role', 'user')
            ->where('created_at', '<', $now->copy()->subMonths(3))
            ->whereDoesntHave('orders', function ($q) use ($now) {
                $q->where('created_at', '>=', $now->copy()->subMonths(3));
            })
            ->count();
        $churnRate = $lastMonthCustomers > 0 ? round(($churned / $lastMonthCustomers) * 100, 1) : 0;

        // Conversion Rate (visitors who bought)
        $totalVisitors = \App\Models\PerfumeView::distinct('user_id')->count('user_id');
        $totalBuyers = Order::distinct('user_id')->count('user_id');
        $conversionRate = $totalVisitors > 0 ? round(($totalBuyers / $totalVisitors) * 100, 1) : 0;

        // Growth Rate (month over month)
        $thisMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('total');
        $lastMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->whereMonth('created_at', $now->copy()->subMonth()->month)
            ->whereYear('created_at', $now->copy()->subMonth()->year)
            ->sum('total');
        $growthRate = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'mrr' => $mrr,
                'arr' => $arr,
                'arpu' => $arpu,
                'ltv' => $ltv,
                'cac' => $cac,
                'churn_rate' => $churnRate,
                'conversion_rate' => $conversionRate,
                'growth_rate' => $growthRate,
                'total_customers' => $totalCustomers,
                'total_revenue' => round($totalRevenue, 2),
            ],
        ]);
    }

    // ──────────────────────────────────────────────
    // SUPER ADMIN SaaS (Cross-tenant)
    // ──────────────────────────────────────────────

    /**
     * GET /admin/saas/dashboard
     * Cross-tenant SaaS overview (super_admin only)
     */
    public function saasDashboard(Request $request)
    {
        $tenants = Tenant::all();

        $totalMrr = 0;
        $totalUsers = 0;
        $totalOrders = 0;
        $totalProducts = 0;
        $activeTenants = 0;

        foreach ($tenants as $t) {
            $sub = $t->data['subscription'] ?? [];
            $totalMrr += $this->getPlanPrice($sub['plan'] ?? 'free');
            if (($sub['is_active'] ?? false) && ($sub['plan'] ?? 'free') !== 'free') {
                $activeTenants++;
            }
        }

        // Cross-tenant totals (use withoutGlobalScopes to bypass tenant isolation)
        $totalUsers = DB::table('users')->where('role', 'user')->count();
        $totalOrders = DB::table('orders')->where('status', '!=', 'cancelled')->count();
        $totalProducts = DB::table('perfumes')->where('is_active', true)->count();
        $totalRevenue = DB::table('orders')->where('status', '!=', 'cancelled')->sum('total');

        $arr = $totalMrr * 12;
        $churnRate = $tenants->count() > 0
            ? round(($tenants->count() - $activeTenants) / max($tenants->count(), 1) * 100, 1)
            : 0;

        // MRR trend (simulated based on tenants)
        $mrrTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $mrrTrend[] = [
                'month' => $month->format('Y-m'),
                'mrr' => $totalMrr * (1 - ($i * 0.08)), // Simulated growth
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'mrr' => round($totalMrr, 2),
                    'arr' => round($arr, 2),
                    'total_tenants' => $tenants->count(),
                    'active_tenants' => $activeTenants,
                    'churn_rate' => $churnRate,
                    'total_users' => $totalUsers,
                    'total_orders' => $totalOrders,
                    'total_products' => $totalProducts,
                    'total_revenue' => round($totalRevenue, 2),
                ],
                'mrr_trend' => $mrrTrend,
            ],
        ]);
    }

    /**
     * GET /admin/saas/tenants
     */
    public function tenantsList(Request $request)
    {
        $tenants = Tenant::with('domains')->get()->map(function ($t) {
            $sub = $t->data['subscription'] ?? [];
            $tenantId = $t->id;

            // Get per-tenant stats
            $userCount = DB::table('users')->where('tenant_id', $tenantId)->where('role', 'user')->count();
            $orderCount = DB::table('orders')->where('tenant_id', $tenantId)->where('status', '!=', 'cancelled')->count();
            $revenue = DB::table('orders')->where('tenant_id', $tenantId)->where('status', '!=', 'cancelled')->sum('total');
            $productCount = DB::table('perfumes')->where('tenant_id', $tenantId)->where('is_active', true)->count();

            return [
                'id' => $t->id,
                'name' => $t->data['name'] ?? 'Unknown',
                'domain' => $t->domains->first()?->domain ?? 'N/A',
                'plan' => $sub['plan'] ?? 'free',
                'status' => $sub['status'] ?? 'active',
                'is_active' => $sub['is_active'] ?? true,
                'contact_email' => $t->data['contact_email'] ?? '',
                'created_at' => $t->created_at,
                'stats' => [
                    'users' => $userCount,
                    'orders' => $orderCount,
                    'revenue' => round($revenue, 2),
                    'products' => $productCount,
                ],
            ];
        });

        $search = $request->input('search');
        if ($search) {
            $tenants = $tenants->filter(function ($t) use ($search) {
                return str_contains(strtolower($t['name']), strtolower($search))
                    || str_contains(strtolower($t['domain']), strtolower($search))
                    || str_contains(strtolower($t['contact_email']), strtolower($search));
            })->values();
        }

        $planFilter = $request->input('plan');
        if ($planFilter) {
            $tenants = $tenants->filter(fn($t) => $t['plan'] === $planFilter)->values();
        }

        return response()->json([
            'success' => true,
            'data' => $tenants,
        ]);
    }

    /**
     * PUT /admin/saas/tenants/{id}/status
     */
    public function updateTenantStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'action' => 'required|in:suspend,activate,delete',
        ]);

        $tenant = Tenant::findOrFail($id);

        switch ($validated['action']) {
            case 'suspend':
                $data = $tenant->data ?? [];
                $data['subscription']['is_active'] = false;
                $data['subscription']['status'] = 'suspended';
                $tenant->data = $data;
                $tenant->save();
                Log::info('Tenant suspended', ['tenant_id' => $id]);
                return response()->json(['message' => 'Tenant suspendu', 'success' => true]);

            case 'activate':
                $data = $tenant->data ?? [];
                $data['subscription']['is_active'] = true;
                $data['subscription']['status'] = 'active';
                $tenant->data = $data;
                $tenant->save();
                Log::info('Tenant activated', ['tenant_id' => $id]);
                return response()->json(['message' => 'Tenant activé', 'success' => true]);

            case 'delete':
                Log::warning('Tenant deletion requested', ['tenant_id' => $id]);
                $tenant->domains()->delete();
                $tenant->delete();
                return response()->json(['message' => 'Tenant supprimé', 'success' => true]);
        }

        return response()->json(['message' => 'Action invalide'], 400);
    }

    // ──────────────────────────────────────────────
    // MONITORING
    // ──────────────────────────────────────────────

    /**
     * GET /admin/saas/monitoring
     * Platform health checks
     */
    public function monitoring(Request $request)
    {
        $checks = [];

        // Laravel API check
        $checks['laravel'] = [
            'name' => 'API Laravel',
            'status' => 'online',
            'latency' => round(microtime(true) - LARAVEL_START, 3) * 1000 . 'ms',
            'version' => app()->version(),
        ];

        // Database check
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $dbLatency = round((microtime(true) - $start) * 1000, 1);
            $checks['database'] = [
                'name' => 'Base de données MySQL',
                'status' => $dbLatency < 500 ? 'online' : 'warning',
                'latency' => $dbLatency . 'ms',
                'tables' => DB::select('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', [config('database.connections.mysql.database')])[0]->count ?? 0,
            ];
        } catch (\Exception $e) {
            $checks['database'] = [
                'name' => 'Base de données MySQL',
                'status' => 'offline',
                'error' => $e->getMessage(),
            ];
        }

        // ML API check
        try {
            $mlUrl = config('services.ml_api.url', 'http://127.0.0.1:8001/recommend');
            $healthUrl = str_replace('/recommend', '/health', $mlUrl);
            $start = microtime(true);
            $response = Http::timeout(3)->get($healthUrl);
            $mlLatency = round((microtime(true) - $start) * 1000, 1);

            $checks['ml_api'] = [
                'name' => 'API Machine Learning',
                'status' => $response->successful() ? 'online' : 'warning',
                'latency' => $mlLatency . 'ms',
                'url' => $mlUrl,
            ];
        } catch (\Exception $e) {
            $checks['ml_api'] = [
                'name' => 'API Machine Learning',
                'status' => 'offline',
                'error' => 'Service indisponible',
                'url' => config('services.ml_api.url'),
            ];
        }

        // Stripe check
        try {
            $stripeKey = config('services.stripe.secret');
            $checks['stripe'] = [
                'name' => 'Stripe Payments',
                'status' => !empty($stripeKey) ? 'online' : 'warning',
                'configured' => !empty($stripeKey),
                'webhook_configured' => !empty(config('services.stripe.webhook_secret')),
            ];
        } catch (\Exception $e) {
            $checks['stripe'] = [
                'name' => 'Stripe Payments',
                'status' => 'offline',
                'error' => $e->getMessage(),
            ];
        }

        // Cache check
        try {
            $start = microtime(true);
            cache()->put('health_check', true, 10);
            cache()->get('health_check');
            $cacheLatency = round((microtime(true) - $start) * 1000, 1);
            $checks['cache'] = [
                'name' => 'Cache',
                'status' => 'online',
                'driver' => config('cache.default'),
                'latency' => $cacheLatency . 'ms',
            ];
        } catch (\Exception $e) {
            $checks['cache'] = [
                'name' => 'Cache',
                'status' => 'warning',
                'driver' => config('cache.default'),
                'error' => $e->getMessage(),
            ];
        }

        $overallStatus = collect($checks)->every(fn($c) => $c['status'] === 'online') ? 'healthy' : 'degraded';
        if (collect($checks)->contains(fn($c) => $c['status'] === 'offline')) {
            $overallStatus = 'unhealthy';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'overall' => $overallStatus,
                'checks' => $checks,
                'timestamp' => now()->toIso8601String(),
                'uptime' => round((microtime(true) - LARAVEL_START) * 1000, 0) . 'ms',
            ],
        ]);
    }

    // ──────────────────────────────────────────────
    // EXPORT
    // ──────────────────────────────────────────────

    /**
     * GET /analytics/export/{type}
     * Export data as CSV
     */
    public function export(Request $request, $type)
    {
        $validTypes = ['orders', 'customers', 'products', 'analytics'];
        if (!in_array($type, $validTypes)) {
            return response()->json(['message' => 'Type d\'export invalide'], 400);
        }

        $filename = $type . '_export_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($type) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            switch ($type) {
                case 'orders':
                    fputcsv($file, ['N° Commande', 'Client', 'Email', 'Total', 'Statut', 'Paiement', 'Date']);
                    Order::with('user:id,name,email')->orderByDesc('created_at')->chunk(100, function ($orders) use ($file) {
                        foreach ($orders as $o) {
                            fputcsv($file, [
                                $o->order_number,
                                $o->user?->name ?? 'N/A',
                                $o->user?->email ?? 'N/A',
                                number_format($o->total, 2, '.', ''),
                                $o->status,
                                $o->payment_status,
                                $o->created_at->format('d/m/Y H:i'),
                            ]);
                        }
                    });
                    break;

                case 'customers':
                    fputcsv($file, ['Nom', 'Email', 'Rôle', 'Statut', 'Commandes', 'Total Dépensé', 'Inscription']);
                    User::where('role', 'user')
                        ->withCount(['orders as order_count'])
                        ->withSum(['orders as total_spent' => fn($q) => $q->where('status', '!=', 'cancelled')], 'total')
                        ->orderByDesc('created_at')
                        ->chunk(100, function ($users) use ($file) {
                            foreach ($users as $u) {
                                fputcsv($file, [
                                    $u->name,
                                    $u->email,
                                    $u->role,
                                    $u->status,
                                    $u->order_count ?? 0,
                                    number_format($u->total_spent ?? 0, 2, '.', ''),
                                    $u->created_at->format('d/m/Y'),
                                ]);
                            }
                        });
                    break;

                case 'products':
                    fputcsv($file, ['Nom', 'Prix', 'Stock', 'Note Moy.', 'Nb Avis', 'Actif', 'Catégorie']);
                    Perfume::with('category:id,name')->orderBy('name')->chunk(100, function ($perfumes) use ($file) {
                        foreach ($perfumes as $p) {
                            fputcsv($file, [
                                $p->name,
                                number_format($p->price, 2, '.', ''),
                                $p->stock_quantity,
                                $p->rating_avg ?? 0,
                                $p->rating_count ?? 0,
                                $p->is_active ? 'Oui' : 'Non',
                                $p->category?->name ?? 'N/A',
                            ]);
                        }
                    });
                    break;

                case 'analytics':
                    fputcsv($file, ['Mois', 'Revenu', 'Commandes', 'Panier Moyen']);
                    $trend = Order::select(
                            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                            DB::raw('SUM(total) as revenue'),
                            DB::raw('COUNT(*) as orders'),
                            DB::raw('AVG(total) as avg_order')
                        )
                        ->where('status', '!=', 'cancelled')
                        ->where('created_at', '>=', now()->subMonths(12))
                        ->groupBy('month')
                        ->orderBy('month')
                        ->get();

                    foreach ($trend as $row) {
                        fputcsv($file, [
                            $row->month,
                            number_format($row->revenue, 2, '.', ''),
                            $row->orders,
                            number_format($row->avg_order, 2, '.', ''),
                        ]);
                    }
                    break;
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // ──────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────

    private function getPlanPrice(string $plan): float
    {
        return match ($plan) {
            'starter' => 29.99,
            'professional', 'business' => 99.99,
            'enterprise' => 299.99,
            default => 0,
        };
    }
}

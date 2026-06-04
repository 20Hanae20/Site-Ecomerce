<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PerfumeController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\TenantCreationController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\SaasAdminController;
use App\Http\Controllers\Api\BrandController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Tenant onboarding & Stripe webhooks (outside tenant middleware)
Route::post('/tenant/create', [TenantCreationController::class, 'create']);
Route::get('/tenant/by-domain', [TenantController::class, 'byDomain']);

// Stripe Webhooks (must be outside tenant middleware, no auth required)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->withoutMiddleware(['auth:sanctum', 'tenant']);

Route::middleware('tenant')->group(function () {
    // Tenant Information
    Route::get('/tenant/current', [TenantController::class, 'current']);
    Route::get('/subscription/plans', [SubscriptionController::class, 'plans']);
    Route::get('/subscription/current', [SubscriptionController::class, 'current']);
    Route::get('/subscription/status', [SubscriptionController::class, 'status']);
    Route::get('/subscription/has-feature', [SubscriptionController::class, 'hasFeature']);

    // Authentication
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/email/verify/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware('signed')->name('verification.verify');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetCode'])->middleware('throttle:6,1');
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword'])->middleware('throttle:6,1');

    // Public catalog
    Route::get('/perfumes', [PerfumeController::class, 'index']);
    Route::get('/perfumes/{perfume}', [PerfumeController::class, 'show']);
    Route::get('/perfumes/{perfume}/reviews', [ReviewController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{brand}', [BrandController::class, 'show']);
    Route::get('/promotions/active', [PromotionController::class, 'activePromotions']);
    Route::post('/promotions/apply', [PromotionController::class, 'apply']);
    Route::get('/settings/public', [SettingController::class, 'publicSettings']);
    Route::post('/recommendations', [\App\Http\Controllers\Api\RecommendationController::class, 'recommend']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);

        // Recommendations Dashboard (viewed + purchased + recommendations)
        Route::get('/recommendations/dashboard', [\App\Http\Controllers\Api\RecommendationController::class, 'dashboard'])
            ->middleware('feature:ai_recommendations');

        // User Profile
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

        // User Addresses
        Route::apiResource('addresses', AddressController::class);

        // Admin routes for perfumes (protected)
        Route::middleware('role:admin,super_admin,gestionnaire')->group(function () {
            Route::post('/perfumes', [PerfumeController::class, 'store']);
            Route::prefix('perfumes/{perfume}')->group(function () {
                Route::put('/', [PerfumeController::class, 'update']);
                Route::delete('/', [PerfumeController::class, 'destroy']);
            });
        });

        // Shopping Cart
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);
        Route::post('/cart/clear', [CartController::class, 'clear']);

        // Orders
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::post('/', [OrderController::class, 'store']);
            Route::get('/{order}', [OrderController::class, 'show']);
            Route::put('/{order}/status', [OrderController::class, 'updateStatus']);
            Route::delete('/{order}/cancel', [OrderController::class, 'cancel']);
        });

        // Payments
        Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
        Route::post('/payments/{payment}/validate', [PaymentController::class, 'validate']);
        Route::post('/payments/{payment}/fail', [PaymentController::class, 'fail']);
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{payment}', [PaymentController::class, 'show']);

        // Admin Logged Routes
        Route::prefix('admin')->middleware('role:admin,super_admin,gestionnaire,moderateur')->group(function () {
            Route::get('/logs', [\App\Http\Controllers\Api\AdminController::class, 'getLogs']);
            Route::get('/action-logs', [\App\Http\Controllers\Api\AdminController::class, 'getActionLogs']);
            Route::get('/stats', [\App\Http\Controllers\Api\AdminController::class, 'getDashboardStats']);

            // AI Analytics Dashboard
            Route::get('/analytics/ml-dashboard', [AnalyticsController::class, 'mlDashboard']);
            Route::get('/analytics/ml-performance', [AnalyticsController::class, 'mlPerformance']);

            // Category Management
            Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

            // Brand Management
            Route::apiResource('brands', BrandController::class)->except(['index', 'show']);
            // Order Management
            Route::get('/orders', [OrderController::class, 'adminIndex']);
            Route::get('/orders/{order}/invoice', [OrderController::class, 'generateInvoice']);

            // User Management
            Route::apiResource('users', UserController::class)->except(['store', 'show', 'update']);
            Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
            Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);

            // Promotion Management
            Route::apiResource('promotions', PromotionController::class)->except(['show']);

            // System Settings
            Route::get('/settings', [SettingController::class, 'index']);
            Route::put('/settings', [SettingController::class, 'update']);

            // Analytics Dashboard (Phase 6)
            Route::prefix('analytics')->group(function () {
                Route::get('/dashboard', [SaasAdminController::class, 'analyticsDashboard']);
                Route::get('/revenue', [SaasAdminController::class, 'revenue']);
                Route::get('/orders', [SaasAdminController::class, 'orders']);
                Route::get('/customers', [SaasAdminController::class, 'customers']);
                Route::get('/products', [SaasAdminController::class, 'products']);
                Route::get('/kpis', [SaasAdminController::class, 'kpis']);
                Route::get('/export/{type}', [SaasAdminController::class, 'export']);
            });

            // Super Admin SaaS (super_admin only)
            Route::middleware('role:super_admin')->prefix('saas')->group(function () {
                Route::get('/dashboard', [SaasAdminController::class, 'saasDashboard']);
                Route::get('/tenants', [SaasAdminController::class, 'tenantsList']);
                Route::put('/tenants/{id}/status', [SaasAdminController::class, 'updateTenantStatus']);
                Route::get('/monitoring', [SaasAdminController::class, 'monitoring']);
            });
        });

        // Reviews
        Route::post('/perfumes/{perfume}/reviews', [ReviewController::class, 'store']);
        Route::put('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
        Route::get('/my-reviews', [ReviewController::class, 'myReviews']);

        // Admin Review Moderation (protected)
        Route::middleware('role:admin,super_admin,gestionnaire,moderateur')->group(function () {
            Route::get('/admin/reviews', [ReviewController::class, 'adminIndex']);
            Route::patch('/reviews/{review}/toggle-approval', [ReviewController::class, 'toggleApproval']);
        });
        
        // Billing & Subscriptions (authenticated)
        Route::prefix('billing')->group(function () {
            Route::post('/checkout', [BillingController::class, 'checkout']);
            Route::get('/current', [BillingController::class, 'current']);
            Route::get('/plans', [BillingController::class, 'plans']);
        });

        // Tenant Admin
        Route::put('/tenant', [TenantController::class, 'update'])->middleware('role:admin,super_admin,gestionnaire');
        
        // Subscription Admin
        Route::put('/subscription/upgrade', [SubscriptionController::class, 'upgrade'])->middleware('role:admin,super_admin,gestionnaire');
    });

    // Admin Authentication (Tenant-aware)
    Route::post('/admin/login', [\App\Http\Controllers\Api\AdminController::class, 'login']);
});

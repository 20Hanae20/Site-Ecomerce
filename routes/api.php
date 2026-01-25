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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetCode'])->middleware('throttle:6,1');
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword'])->middleware('throttle:6,1');

Route::get('/perfumes', [PerfumeController::class, 'index']);
Route::get('/perfumes/{perfume}', [PerfumeController::class, 'show']);
Route::get('/perfumes/{perfume}/reviews', [ReviewController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/promotions/active', [PromotionController::class, 'activePromotions']);
Route::post('/promotions/apply', [PromotionController::class, 'apply']);
Route::get('/settings/public', [SettingController::class, 'publicSettings']);
Route::post('/recommendations', [\App\Http\Controllers\Api\RecommendationController::class, 'recommend']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // User Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // User Addresses
    Route::apiResource('addresses', AddressController::class);

    // Admin routes for perfumes
    Route::post('/perfumes', [PerfumeController::class, 'store']);
    Route::prefix('perfumes/{perfume}')->group(function () {
        Route::put('/', [PerfumeController::class, 'update']);
        Route::delete('/', [PerfumeController::class, 'destroy']);
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
    Route::prefix('admin')->group(function () {
        Route::get('/logs', [\App\Http\Controllers\Api\AdminController::class, 'getLogs']);
        Route::get('/action-logs', [\App\Http\Controllers\Api\AdminController::class, 'getActionLogs']);
        Route::get('/stats', [\App\Http\Controllers\Api\AdminController::class, 'getDashboardStats']);
        
        // Category Management
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
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
    });

    // Reviews
    Route::post('/perfumes/{perfume}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::get('/my-reviews', [ReviewController::class, 'myReviews']);

    // Admin Review Moderation
    Route::get('/admin/reviews', [ReviewController::class, 'adminIndex']);
    Route::patch('/reviews/{review}/toggle-approval', [ReviewController::class, 'toggleApproval']);
});

// Admin Authentication (Public)
Route::post('/admin/login', [\App\Http\Controllers\Api\AdminController::class, 'login']);

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\StripeWebhookController;

// Serve React frontend for all routes (SPA mode)
Route::get('/{path?}', function () {
    return view('welcome');
})->where('path', '.*');

// API routes are handled in routes/api.php with /api prefix
Route::post('/billing/subscribe', [BillingController::class, 'createCheckout'])->middleware('tenant');
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

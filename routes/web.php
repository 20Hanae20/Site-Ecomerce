<?php

use Illuminate\Support\Facades\Route;

// Serve React frontend for all routes (SPA mode)
Route::get('/{path?}', function () {
    return view('welcome');
})->where('path', '.*');

// API routes are handled in routes/api.php with /api prefix

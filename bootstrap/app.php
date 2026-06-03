<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \App\Http\Middleware\CorsMiddleware::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\CorsMiddleware::class,
        ]);

        // Register tenancy middleware only when not running tests. Tests use in-memory DB.
        if (env('APP_ENV') !== 'testing') {
            $middleware->api(prepend: [
                \App\Http\Middleware\InitializeTenancyWithFallback::class,
            ]);

            $middleware->web(append: [
                \App\Http\Middleware\InitializeTenancyWithFallback::class,
            ]);
        }
        
        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'tenant' => \App\Http\Middleware\InitializeTenancyWithFallback::class,
            'prevent-central' => \Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'feature' => \App\Http\Middleware\CheckFeatureGate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

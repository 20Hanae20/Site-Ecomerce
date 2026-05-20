<?php

return [
    'stripe' => [
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'webhook_tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
    ],

    // Default currency for subscriptions
    'currency' => env('CASHIER_CURRENCY', 'usd'),

    // Optional: prefix for Stripe customer metadata
    'customer_prefix' => env('CASHIER_CUSTOMER_PREFIX', 'tenant_'),
];

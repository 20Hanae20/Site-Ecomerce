<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Billing Plans
    |--------------------------------------------------------------------------
    |
    | Define all available subscription plans with their Stripe price IDs,
    | features, and limitations. The BillingController and SubscriptionController
    | both reference this config.
    |
    */

    'plans' => [
        'free' => [
            'name' => 'Gratuit',
            'description' => 'Essai gratuit pour découvrir la plateforme',
            'price' => 0,
            'features' => ['basic_catalog', 'reviews'],
            'limitations' => [
                'max_products' => 50,
                'max_custom_fields' => 0,
                'ai_recommendations' => false,
            ],
            'monthly' => null,
            'yearly' => null,
        ],

        'starter' => [
            'name' => 'Starter',
            'description' => 'Pour démarrer votre boutique en ligne',
            'price' => 29,
            'features' => ['basic_catalog', 'reviews', 'promotions', 'analytics', 'custom_branding'],
            'limitations' => [
                'max_products' => 500,
                'max_custom_fields' => 5,
                'ai_recommendations' => false,
            ],
            'monthly' => env('STRIPE_PRICE_STARTER_MONTHLY', 'price_starter_monthly'),
            'yearly' => env('STRIPE_PRICE_STARTER_YEARLY', 'price_starter_yearly'),
        ],

        'business' => [
            'name' => 'Business',
            'description' => 'Pour les professionnels de la parfumerie',
            'price' => 99,
            'features' => [
                'basic_catalog', 'reviews', 'promotions', 'analytics',
                'custom_branding', 'ai_recommendations', 'team_management',
                'api_access', 'advanced_promotions',
            ],
            'limitations' => [
                'max_products' => 5000,
                'max_custom_fields' => 20,
                'ai_recommendations' => true,
            ],
            'monthly' => env('STRIPE_PRICE_BUSINESS_MONTHLY', 'price_business_monthly'),
            'yearly' => env('STRIPE_PRICE_BUSINESS_YEARLY', 'price_business_yearly'),
        ],

        'enterprise' => [
            'name' => 'Enterprise',
            'description' => 'Solution sur mesure pour les grandes entreprises',
            'price' => 'custom',
            'features' => [
                'basic_catalog', 'reviews', 'promotions', 'analytics',
                'custom_branding', 'ai_recommendations', 'team_management',
                'api_access', 'advanced_promotions', 'multi_warehouse',
                'white_label', 'dedicated_support',
            ],
            'limitations' => [
                'max_products' => 'unlimited',
                'max_custom_fields' => 'unlimited',
                'ai_recommendations' => true,
            ],
            'monthly' => env('STRIPE_PRICE_ENTERPRISE_MONTHLY'),
            'yearly' => env('STRIPE_PRICE_ENTERPRISE_YEARLY'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Plan
    |--------------------------------------------------------------------------
    */
    'default_plan' => 'free',

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */
    'currency' => env('CASHIER_CURRENCY', 'eur'),

    /*
    |--------------------------------------------------------------------------
    | Trial Period (days)
    |--------------------------------------------------------------------------
    */
    'trial_days' => env('BILLING_TRIAL_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | Grace Period (days after payment failure before deactivation)
    |--------------------------------------------------------------------------
    */
    'grace_period_days' => env('BILLING_GRACE_PERIOD', 7),

    /*
    |--------------------------------------------------------------------------
    | Max payment failures before deactivation
    |--------------------------------------------------------------------------
    */
    'max_payment_failures' => env('BILLING_MAX_FAILURES', 3),
];

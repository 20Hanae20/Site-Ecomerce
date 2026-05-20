<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $tables = [
            'users',
            'addresses',
            'categories',
            'perfumes',
            'carts',
            'cart_items',
            'orders',
            'order_items',
            'payments',
            'reviews',
            'stock_movements',
            'promotions',
            'settings',
            'perfume_views',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->unsignedBigInteger('tenant_id')->nullable()->after('id');
                    $table->index('tenant_id');
                });
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'perfume_views',
            'settings',
            'promotions',
            'stock_movements',
            'reviews',
            'payments',
            'order_items',
            'orders',
            'cart_items',
            'carts',
            'perfumes',
            'categories',
            'addresses',
            'users',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropIndex(['tenant_id']);
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};

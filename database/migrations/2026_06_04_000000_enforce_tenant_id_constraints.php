<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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

        // Resolve or create a default tenant ID to associate null rows with
        $firstTenantId = null;
        if (Schema::hasTable('tenants')) {
            $firstTenantId = DB::table('tenants')->value('id');
            if (! $firstTenantId) {
                $firstTenantId = DB::table('tenants')->insertGetId([
                    'name' => 'Default Tenant',
                    'domains' => json_encode([]),
                    'data' => json_encode([]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'tenant_id')) {
                if ($firstTenantId) {
                    DB::table($tableName)->whereNull('tenant_id')->update(['tenant_id' => $firstTenantId]);
                }

                $indexes = Schema::getIndexes($tableName);
                $hasIndex = collect($indexes)->contains(function ($index) {
                    return in_array('tenant_id', $index['columns']);
                });

                Schema::table($tableName, function (Blueprint $table) use ($tableName, $hasIndex) {
                    if (! Schema::hasColumn($tableName, 'tenant_id')) {
                        return;
                    }

                    $table->unsignedBigInteger('tenant_id')->nullable(false)->change();
                    
                    if (! $hasIndex) {
                        $table->index('tenant_id');
                    }
                });
            }
        }
    }

    public function down(): void
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

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'tenant_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->unsignedBigInteger('tenant_id')->nullable()->change();
                });
            }
        }
    }
};

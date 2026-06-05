<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            if (! Schema::hasColumn('perfumes', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('id');
            }

            if (! Schema::hasColumn('perfumes', 'stock_quantity')) {
                $table->integer('stock_quantity')->default(0)->after('price');
            }

            if (! Schema::hasColumn('perfumes', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('stock_quantity');
            }

            if (! Schema::hasColumn('perfumes', 'rating_avg')) {
                $table->decimal('rating_avg', 3, 2)->default(0)->after('is_active');
            }

            if (! Schema::hasColumn('perfumes', 'views')) {
                $table->integer('views')->default(0)->after('rating_avg');
            }

            if (! Schema::hasColumn('perfumes', 'sales_count')) {
                $table->integer('sales_count')->default(0)->after('views');
            }
        });

                if (DB::getDriverName() !== 'sqlite') {
            $hasForeignKey = DB::table('information_schema.TABLE_CONSTRAINTS')
                ->where('CONSTRAINT_SCHEMA', DB::getDatabaseName())
                ->where('TABLE_NAME', 'perfumes')
                ->where('CONSTRAINT_NAME', 'perfumes_category_id_foreign')
                ->exists();

            if (Schema::hasColumn('perfumes', 'category_id') && ! $hasForeignKey) {
                DB::statement('ALTER TABLE perfumes ADD CONSTRAINT perfumes_category_id_foreign FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            if (Schema::hasColumn('perfumes', 'category_id')) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            }

            $columns = array_filter(['stock_quantity', 'is_active', 'rating_avg', 'views', 'sales_count'], fn ($column) => Schema::hasColumn('perfumes', $column));

            if (! empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};


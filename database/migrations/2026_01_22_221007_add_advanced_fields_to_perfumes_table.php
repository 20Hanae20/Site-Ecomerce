<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null')->after('id');
            $table->integer('stock')->default(0)->after('price');
            $table->boolean('is_active')->default(true)->after('stock');
            $table->decimal('rating', 3, 2)->default(0)->after('is_active');
            $table->integer('views')->default(0)->after('rating');
            $table->integer('sales_count')->default(0)->after('views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id', 'stock', 'is_active', 'rating', 'views', 'sales_count']);
        });
    }
};

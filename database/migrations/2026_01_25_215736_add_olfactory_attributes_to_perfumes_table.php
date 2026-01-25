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
            $table->string('olfactory_family')->nullable()->after('display_role'); // e.g., Floral, Woody, Oriental
            $table->integer('intensity')->default(5)->after('olfactory_family'); // 1-10 scale
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            $table->dropColumn(['olfactory_family', 'intensity']);
        });
    }
};

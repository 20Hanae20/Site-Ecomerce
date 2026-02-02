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
        if (!Schema::hasColumn('perfumes', 'olfactory_family')) {
            Schema::table('perfumes', function (Blueprint $table) {
                $table->string('olfactory_family')->nullable()->after('image_url'); // e.g., Floral, Woody, Oriental
                $table->string('intensity')->nullable()->after('olfactory_family'); // e.g., Forte, Moyenne, Légère
            });
        }
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

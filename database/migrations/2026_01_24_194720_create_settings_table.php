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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // Default settings
        DB::table('settings')->insert([
            ['key' => 'site_name', 'value' => 'Site Parfum', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'contact@siteparfum.fr', 'group' => 'general'],
            ['key' => 'shipping_fee', 'value' => '5.90', 'group' => 'shipping'],
            ['key' => 'currency', 'value' => '€', 'group' => 'general'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

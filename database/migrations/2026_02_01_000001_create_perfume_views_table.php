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
        Schema::create('perfume_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('perfume_id');
            $table->integer('view_count')->default(1);
            $table->timestamp('viewed_at')->useCurrent();
            $table->timestamp('last_viewed_at')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('perfume_id')->references('id')->on('perfumes')->onDelete('cascade');

            // Indexes
            $table->index(['user_id', 'last_viewed_at']);
            $table->index(['perfume_id']);
            $table->unique(['user_id', 'perfume_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfume_views');
    }
};

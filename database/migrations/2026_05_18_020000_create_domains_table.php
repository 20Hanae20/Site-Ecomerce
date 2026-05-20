<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('domains')) {
            Schema::create('domains', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->string('domain')->unique();
                $table->timestamps();

                $table->foreign('tenant_id')
                    ->references('id')
                    ->on('tenants')
                    ->cascadeOnDelete();
            });

            return;
        }

        Schema::table('domains', function (Blueprint $table) {
            if (! Schema::hasColumn('domains', 'tenant_id')) {
                $table->unsignedBigInteger('tenant_id')->after('id');
            }
            if (! Schema::hasColumn('domains', 'domain')) {
                $table->string('domain')->unique()->after('tenant_id');
            }
            if (! Schema::hasColumn('domains', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('domains', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domains');
    }
};

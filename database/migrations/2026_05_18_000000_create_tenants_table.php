<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('tenants')) {
            Schema::create('tenants', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->json('domains')->nullable();
                $table->json('data')->nullable();
                $table->timestamps();
            });

            return;
        }

        Schema::table('tenants', function (Blueprint $table) {
            if (! Schema::hasColumn('tenants', 'name')) {
                $table->string('name')->nullable()->after('id');
            }
            if (! Schema::hasColumn('tenants', 'domains')) {
                $table->json('domains')->nullable()->after('name');
            }
            if (! Schema::hasColumn('tenants', 'data')) {
                $table->json('data')->nullable()->after('domains');
            }
            if (! Schema::hasColumn('tenants', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('tenants', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};

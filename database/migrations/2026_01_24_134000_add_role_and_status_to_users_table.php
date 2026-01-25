<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('password'); // super_admin, admin, moderateur, gestionnaire, user
            $table->string('status')->default('active')->after('role'); // active, blocked
            $table->integer('login_attempts')->default(0)->after('status');
            $table->timestamp('last_login_at')->nullable()->after('login_attempts');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'login_attempts', 'last_login_at']);
        });
    }
};

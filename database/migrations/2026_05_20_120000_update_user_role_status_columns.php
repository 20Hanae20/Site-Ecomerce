<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'role') && DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `users` MODIFY `role` varchar(255) NOT NULL DEFAULT 'user'");
        }

        if (Schema::hasColumn('users', 'status') && DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `users` MODIFY `status` varchar(255) NOT NULL DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'role') && DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `users` MODIFY `role` enum('customer','admin','manager') NOT NULL DEFAULT 'customer'");
        }

        if (Schema::hasColumn('users', 'status') && DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `users` MODIFY `status` enum('active','inactive','banned') NOT NULL DEFAULT 'active'");
        }
    }
};

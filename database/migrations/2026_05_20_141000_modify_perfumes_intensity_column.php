<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('perfumes', 'intensity')) {
            return;
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `perfumes` MODIFY `intensity` varchar(100) DEFAULT NULL");
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('perfumes', 'intensity')) {
            return;
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `perfumes` MODIFY `intensity` enum('light','medium','strong') DEFAULT NULL");
        }
    }
};

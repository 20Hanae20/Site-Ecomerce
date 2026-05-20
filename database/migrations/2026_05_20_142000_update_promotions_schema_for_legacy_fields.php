<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('promotions')) {
            return;
        }

        if (! Schema::hasColumn('promotions', 'start_date')) {
            DB::statement("ALTER TABLE `promotions` ADD `start_date` datetime NULL AFTER `value`");
        }

        if (! Schema::hasColumn('promotions', 'end_date')) {
            DB::statement("ALTER TABLE `promotions` ADD `end_date` datetime NULL AFTER `start_date`");
        }

        DB::statement("ALTER TABLE `promotions` MODIFY `type` enum('percentage','fixed_amount','fixed') NOT NULL");

        if (Schema::hasColumn('promotions', 'starts_at')) {
            DB::statement("UPDATE `promotions` SET `start_date` = `starts_at` WHERE `start_date` IS NULL");
        }

        if (Schema::hasColumn('promotions', 'expires_at')) {
            DB::statement("UPDATE `promotions` SET `end_date` = `expires_at` WHERE `end_date` IS NULL");
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('promotions')) {
            return;
        }

        if (Schema::hasColumn('promotions', 'start_date')) {
            DB::statement("ALTER TABLE `promotions` DROP COLUMN `start_date`");
        }

        if (Schema::hasColumn('promotions', 'end_date')) {
            DB::statement("ALTER TABLE `promotions` DROP COLUMN `end_date`");
        }

        DB::statement("ALTER TABLE `promotions` MODIFY `type` enum('percentage','fixed_amount') NOT NULL");
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('addresses')) {
            return;
        }

        // Only perform MySQL-specific ALTER/SHOW operations when using MySQL driver
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $columns = DB::select("SHOW COLUMNS FROM `addresses`");
        $columnNames = array_map(fn($column) => $column->Field, $columns);

        if (! in_array('neighborhood', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `neighborhood` varchar(255) DEFAULT NULL AFTER `city`");
        }

        if (! in_array('full_address', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `full_address` varchar(255) DEFAULT NULL AFTER `neighborhood`");
        }

        if (! in_array('zip_code', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `zip_code` varchar(20) DEFAULT '' AFTER `full_address`");
        }

        if (! in_array('country', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `country` varchar(100) NOT NULL DEFAULT 'Maroc' AFTER `zip_code`");
        } else {
            DB::statement("ALTER TABLE `addresses` MODIFY `country` varchar(100) NOT NULL DEFAULT 'Maroc'");
        }

        if (! in_array('is_default', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `is_default` tinyint(1) NOT NULL DEFAULT 0 AFTER `country`");
        }

        if (in_array('address_line_1', $columnNames) && in_array('full_address', $columnNames)) {
            DB::statement("UPDATE `addresses` SET `full_address` = CONCAT(`address_line_1`, IF(`address_line_2` IS NULL OR `address_line_2` = '', '', CONCAT(', ', `address_line_2`)))");
        }

        if (in_array('postal_code', $columnNames) && in_array('zip_code', $columnNames)) {
            DB::statement("UPDATE `addresses` SET `zip_code` = `postal_code`");
        }

        if (in_array('state', $columnNames) && in_array('neighborhood', $columnNames)) {
            DB::statement("UPDATE `addresses` SET `neighborhood` = COALESCE(`state`, 'Quartier Palmier')");
        }

        if (! in_array('country', $columnNames)) {
            DB::statement("UPDATE `addresses` SET `country` = 'Maroc' WHERE `country` IS NULL OR `country` = ''");
        }

        $dropColumns = [];

        foreach (['type', 'address_line_1', 'address_line_2', 'state', 'postal_code'] as $oldColumn) {
            if (in_array($oldColumn, $columnNames)) {
                $dropColumns[] = "DROP COLUMN `$oldColumn`";
            }
        }

        if ($dropColumns) {
            DB::statement('ALTER TABLE `addresses` ' . implode(', ', $dropColumns));
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('addresses')) {
            return;
        }

        $columns = DB::select("SHOW COLUMNS FROM `addresses`");
        $columnNames = array_map(fn($column) => $column->Field, $columns);

        if (! in_array('type', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `type` enum('billing','shipping') NOT NULL DEFAULT 'shipping' AFTER `user_id`");
        }

        if (! in_array('address_line_1', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `address_line_1` varchar(255) NOT NULL AFTER `user_id`");
        }

        if (! in_array('address_line_2', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `address_line_2` varchar(255) DEFAULT NULL AFTER `address_line_1`");
        }

        if (! in_array('state', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `state` varchar(100) DEFAULT NULL AFTER `address_line_2`");
        }

        if (! in_array('postal_code', $columnNames)) {
            DB::statement("ALTER TABLE `addresses` ADD `postal_code` varchar(20) NOT NULL DEFAULT '' AFTER `state`");
        }
    }
};

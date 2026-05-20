<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Only run raw MySQL statements when using MySQL driver
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('card', 'paypal', 'cash', 'bank_transfer', 'cod', 'stripe') DEFAULT 'card'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            // Revert back to original enum values
            DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('card', 'paypal', 'cash', 'bank_transfer') DEFAULT 'card'");
        }
    }
};

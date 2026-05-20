<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'idcategorie') && ! Schema::hasColumn('categories', 'id')) {
                $table->renameColumn('idcategorie', 'id');
            }

            if (Schema::hasColumn('categories', 'nom') && ! Schema::hasColumn('categories', 'name')) {
                $table->renameColumn('nom', 'name');
            }

            if (! Schema::hasColumn('categories', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }

            if (! Schema::hasColumn('categories', 'description')) {
                $table->text('description')->nullable()->after('slug');
            }
        });

        $rows = DB::table('categories')->get();

        foreach ($rows as $row) {
            $slug = $row->slug ?? Str::slug($row->name ?? 'category-'.$row->id);
            if ($slug === '') {
                $slug = 'category-'.$row->id;
            }

            DB::table('categories')
                ->where('id', $row->id)
                ->update(['slug' => $slug]);
        }

        if (Schema::hasColumn('categories', 'slug')) {
            try {
                Schema::table('categories', function (Blueprint $table) {
                    $table->unique('slug');
                });
            } catch (\Exception $e) {
                // Ignore duplicate index / already present index errors during idempotent migrations.
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'slug')) {
                $table->dropUnique(['slug']);
            }

            if (Schema::hasColumn('categories', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('categories', 'slug')) {
                $table->dropColumn('slug');
            }

            if (Schema::hasColumn('categories', 'name') && ! Schema::hasColumn('categories', 'nom')) {
                $table->renameColumn('name', 'nom');
            }

            if (Schema::hasColumn('categories', 'id') && ! Schema::hasColumn('categories', 'idcategorie')) {
                $table->renameColumn('id', 'idcategorie');
            }
        });
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Hommes', 'slug' => 'hommes', 'description' => 'Parfums masculins aux notes boisées, épicées et fraîches.', 'is_active' => true],
            ['name' => 'Femmes', 'slug' => 'femmes', 'description' => 'Parfums féminins aux notes florales, sucrées et élégantes.', 'is_active' => true],
            ['name' => 'Unisex', 'slug' => 'unisex', 'description' => 'Parfums mixtes qui transcendent les genres.', 'is_active' => true],
            ['name' => 'Luxe', 'slug' => 'luxe', 'description' => 'Éditions limitées et créations de haute parfumerie.', 'is_active' => true],
            ['name' => 'Coffrets', 'slug' => 'coffrets', 'description' => 'Ensembles cadeaux exclusifs pour toutes les occasions.', 'is_active' => true],
            ['name' => 'Enfants', 'slug' => 'enfants', 'description' => 'Parfums doux et hypoallergéniques pour les plus petits.', 'is_active' => true],
        ];

        $tenantId = tenant('id') ?? \App\Models\Tenant::first()?->id;
        $tenantSuffix = $tenantId ? '-' . $tenantId : '';

        foreach ($categories as $cat) {
            $slug = $cat['slug'] . $tenantSuffix;
            $catData = array_merge($cat, ['slug' => $slug]);
            Category::updateOrCreate(['slug' => $slug], $catData);
        }
    }
}

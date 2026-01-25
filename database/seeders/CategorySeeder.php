<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Hommes', 'slug' => 'hommes', 'description' => 'Parfums pour hommes'],
            ['name' => 'Femmes', 'slug' => 'femmes', 'description' => 'Parfums pour femmes'],
            ['name' => 'Unisex', 'slug' => 'unisex', 'description' => 'Parfums mixtes'],
            ['name' => 'Luxe', 'slug' => 'luxe', 'description' => 'Éditions limitées et prestige'],
        ];

        foreach ($categories as $cat) {
            \App\Models\Category::create($cat);
        }
    }
}

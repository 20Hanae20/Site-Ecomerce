<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Category;
use App\Models\Perfume;

class PerfumeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $perfumes = [
            // HOMMES
            [
                'name' => 'Aurum Noir',
                'description' => 'Un sillage ténébreux et doré. Un parfum boisé aromatique pour l’homme qui refuse le conformisme.',
                'notes' => 'Agrumes, Menthe, Poivre rose, Gingembre, Iso E Super, Jasmin, Muscade',
                'price' => 120.00,
                'stock_quantity' => 50,
                'category_id' => 1,
                'rating_avg' => 4.8,
                'image_url' => '/images/perfumes/masculine.png',
                'olfactory_family' => 'Boisé',
                'intensity' => 'Forte',
                'views' => 1250,
                'sales_count' => 450,
                'created_at' => now(),
            ],
            [
                'name' => 'Bleu de Chanel',
                'description' => 'Un classique intemporel. Une composition fraîcheur brute, entre puissance et noblesse.',
                'notes' => 'Bergamote de Calabre, Poivre du Sichuan, Lavande, Ambroxan',
                'price' => 115.00,
                'stock_quantity' => 45,
                'category_id' => 1,
                'rating_avg' => 4.7,
                'image_url' => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
                'olfactory_family' => 'Fougère',
                'intensity' => 'Forte',
                'views' => 2100,
                'sales_count' => 890,
                'created_at' => now(),
            ],
            [
                'name' => 'Suavage Elixir',
                'description' => 'L\'essence même de la virilité sauvage.',
                'notes' => 'Lavande, Cannelle, Muscade, Cardamome',
                'price' => 155.00,
                'stock_quantity' => 30,
                'category_id' => 1,
                'rating_avg' => 4.9,
                'image_url' => 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&q=80&w=800',
                'olfactory_family' => 'Aromatique',
                'intensity' => 'Extrême',
                'views' => 1800,
                'sales_count' => 600,
                'created_at' => now(),
            ],

            // FEMMES
            [
                'name' => 'Aurora Rose',
                'description' => 'Un bouquet de roses à l\'aurore. L’essence même de la féminité délicate.',
                'notes' => 'Rose de Damas, Pivoine, Musc blanc, Mandarine',
                'price' => 135.00,
                'stock_quantity' => 40,
                'category_id' => 2,
                'rating_avg' => 4.9,
                'image_url' => '/images/perfumes/feminine.png',
                'olfactory_family' => 'Floral',
                'intensity' => 'Moyenne',
                'views' => 3200,
                'sales_count' => 950,
                'created_at' => now(),
            ],
            [
                'name' => 'L\'Interdit Givenchy',
                'description' => 'Le frisson du défendu. Un hommage à la féminité audacieuse.',
                'notes' => 'Fleur d\'oranger, Jasmin, Tubéreuse, Patchouli, Vétiver',
                'price' => 110.00,
                'stock_quantity' => 35,
                'category_id' => 2,
                'rating_avg' => 4.7,
                'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
                'olfactory_family' => 'Floral Boisé',
                'intensity' => 'Forte',
                'views' => 2800,
                'sales_count' => 1100,
                'created_at' => now(),
            ],

            // UNISEX
            [
                'name' => 'Aura Essentiel',
                'description' => 'La pureté incarnée. Un parfum minimaliste et moderne pour tous.',
                'notes' => 'Cèdre, Ambre, Accord lactonique, Bergamote',
                'price' => 180.00,
                'stock_quantity' => 25,
                'category_id' => 3,
                'rating_avg' => 4.8,
                'image_url' => '/images/perfumes/unisex.png',
                'olfactory_family' => 'Boisé Musqué',
                'intensity' => 'Moyenne',
                'views' => 1100,
                'sales_count' => 400,
                'created_at' => now(),
            ],
            [
                'name' => 'Jazz Club',
                'description' => 'L\'ambiance tamisée d\'un club de jazz.',
                'notes' => 'Rhum, Tabac, Vanille, Poivre rose',
                'price' => 125.00,
                'stock_quantity' => 50,
                'category_id' => 3,
                'rating_avg' => 4.6,
                'image_url' => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
                'olfactory_family' => 'Oriental',
                'intensity' => 'Moyenne',
                'views' => 900,
                'sales_count' => 350,
                'created_at' => now(),
            ],

            // LUXE
            [
                'name' => 'Mystique Oud',
                'description' => 'L\'or noir de l\'Orient. Une signature olfactive lumineuse et racée.',
                'notes' => 'Bois d\'Oud, Safran, Ambre gris, Encens',
                'price' => 420.00,
                'stock_quantity' => 12,
                'category_id' => 4,
                'rating_avg' => 5.0,
                'image_url' => '/images/perfumes/extreme.png',
                'olfactory_family' => 'Oriental Boisé',
                'intensity' => 'Extrême',
                'views' => 7500,
                'sales_count' => 55,
                'created_at' => now(),
            ],
            [
                'name' => 'Royal Heritage',
                'description' => 'Un héritage de puissance.',
                'notes' => 'Cuir, Iris de Toscane, Santal, Myrrhe',
                'price' => 380.00,
                'stock_quantity' => 15,
                'category_id' => 4,
                'rating_avg' => 4.9,
                'image_url' => 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&q=80&w=800',
                'olfactory_family' => 'Cuiré',
                'intensity' => 'Extrême',
                'views' => 5200,
                'sales_count' => 40,
                'created_at' => now(),
            ],
        ];

        $tenantId = tenant('id') ?? Tenant::first()?->id;
        $categoryMapping = [
            1 => 'hommes',
            2 => 'femmes',
            3 => 'unisex',
            4 => 'luxe',
            5 => 'coffrets',
            6 => 'enfants',
        ];

        // Fetch categories scoped for current tenant
        $categoriesMap = Category::all()->pluck('id', 'slug')->toArray();

        foreach ($perfumes as $p) {
            $p['tenant_id'] = $tenantId;

            // Map standard category ID to the current tenant's Category
            $baseSlug = $categoryMapping[$p['category_id'] ?? 1];
            $suffixedSlug = $baseSlug . '-' . $tenantId;

            $p['category_id'] = $categoriesMap[$suffixedSlug] ?? ($categoriesMap[$baseSlug] ?? null);

            Perfume::create($p);
        }
    }
}

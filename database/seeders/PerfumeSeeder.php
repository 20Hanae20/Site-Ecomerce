<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PerfumeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $perfumes = [
            [
                'name' => 'Bleu de Chanel',
                'description' => 'Un parfum boisé aromatique pour l’homme qui refuse le conformisme.',
                'notes' => 'Agrumes, Menthe, Poivre rose',
                'price' => 120.00,
                'stock' => 50,
                'category_id' => 1,
                'rating' => 4.8,
                'image_url' => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
                'created_at' => now(),
            ],
            [
                'name' => 'Chanel No. 5',
                'description' => 'L’essence même de la féminité. Un bouquet floral poudré.',
                'notes' => 'Aldéhydes, Ylang-Ylang, Néroli',
                'price' => 145.00,
                'stock' => 30,
                'category_id' => 2,
                'rating' => 4.9,
                'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
                'created_at' => now(),
            ],
            [
                'name' => 'Tobacco Vanille',
                'description' => 'Un classique moderne, une version opulente d’un club de gentlemen.',
                'notes' => 'Tabac, Vanille, Cacao',
                'price' => 250.00,
                'stock' => 15,
                'category_id' => 3,
                'rating' => 4.7,
                'image_url' => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
                'created_at' => now(),
            ],
            [
                'name' => 'Sauvage Dior',
                'description' => 'Une composition fraîcheur brute, entre puissance et noblesse.',
                'notes' => 'Bergamote, Ambroxan, Poivre',
                'price' => 110.00,
                'stock' => 45,
                'category_id' => 1,
                'rating' => 4.6,
                'image_url' => 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&q=80&w=800',
                'created_at' => now(),
            ],
            [
                'name' => 'Black Opium',
                'description' => 'Le premier café floral par Yves Saint Laurent. Rock et glamour.',
                'notes' => 'Café noir, Fleurs blanches, Vanille',
                'price' => 95.00,
                'stock' => 25,
                'category_id' => 2,
                'rating' => 4.5,
                'image_url' => 'https://images.unsplash.com/photo-1615037518114-046603a1040a?auto=format&fit=crop&q=80&w=800',
                'created_at' => now(),
            ],
            [
                'name' => 'Santal 33',
                'description' => 'Un parfum unisexe emblématique qui capture l’esprit de l’ouest américain.',
                'notes' => 'Santal, Cardamome, Violette',
                'price' => 190.00,
                'stock' => 10,
                'category_id' => 3,
                'rating' => 4.8,
                'image_url' => 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=800',
                'created_at' => now(),
            ],
            [
                'name' => 'La Vie Est Belle',
                'description' => 'Une déclaration universelle à la beauté de la vie.',
                'notes' => 'Iris, Patchouli, Gourmand',
                'price' => 85.00,
                'stock' => 60,
                'category_id' => 2,
                'rating' => 4.4,
                'image_url' => 'https://images.unsplash.com/photo-1563170339-2cffb3f5d538?auto=format&fit=crop&q=80&w=800',
                'created_at' => now()->subMonths(2),
            ],
            [
                'name' => 'Acqua di Gio',
                'description' => 'Une ode à la perfection de la nature et à l’essence de l’homme.',
                'notes' => 'Notes marines, Bergamote',
                'price' => 75.00,
                'stock' => 40,
                'category_id' => 1,
                'rating' => 4.5,
                'image_url' => 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
                'created_at' => now()->subMonths(3),
            ],
        ];

        foreach ($perfumes as $p) {
            \App\Models\Perfume::create($p);
        }

    }
}

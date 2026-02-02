<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create specific Manager users
        $manager1 = User::updateOrCreate(
            ['email' => 'gestion@siteparfum.fr'],
            [
                'name' => 'Marc Gestion',
                'password' => Hash::make('gestion123'),
                'role' => 'gestionnaire',
                'status' => 'active'
            ]
        );
        $this->createAddress($manager1, 'Paris', '75001');

        $manager2 = User::updateOrCreate(
            ['email' => 'staff@siteparfum.fr'],
            [
                'name' => 'Alice Staff',
                'password' => Hash::make('staff123'),
                'role' => 'gestionnaire',
                'status' => 'active'
            ]
        );
        $this->createAddress($manager2, 'Lyon', '69002');

        // 2. Create Explicit Demo Client (for easier testing)
        $clientProto = User::updateOrCreate(
            ['email' => 'client@siteparfum.fr'],
            [
                'name' => 'Jean Client',
                'first_name' => 'Jean',
                'last_name' => 'Client',
                'password' => Hash::make('client123'),
                'role' => 'user',
                'status' => 'active'
            ]
        );
        $this->createAddress($clientProto, 'Casablanca', '20000', 'Maarif', 'Rue Taha Hussein');

        // 3. Create more specific users in different cities
        $userRabat = User::updateOrCreate(
            ['email' => 'rabat@demo.ma'],
            ['name' => 'Yassine Rabat', 'first_name' => 'Yassine', 'last_name' => 'Rabat', 'password' => Hash::make('client123'), 'role' => 'user', 'status' => 'active']
        );
        $this->createAddress($userRabat, 'Rabat', '10000', 'Agdal', 'Avenue de France');

        $userTangier = User::updateOrCreate(
            ['email' => 'tanger@demo.ma'],
            ['name' => 'Sara Tanger', 'first_name' => 'Sara', 'last_name' => 'Tanger', 'password' => Hash::make('client123'), 'role' => 'user', 'status' => 'active']
        );
        $this->createAddress($userTangier, 'Tanger', '90000', 'Malabata', 'Corniche de Tanger');

        // 4. Create 5 random demo clients
        $clients = User::factory(5)->create([
            'password' => Hash::make('client123'),
            'role' => 'user',
            'status' => 'active'
        ]);

        foreach ($clients as $client) {
            $this->createAddress($client);
        }
        
        $this->command->info('13 test users (2 managers + 1 fixed client + 10 random) created with addresses.');
    }

    private function createAddress(User $user, $city = 'Casablanca', $zip = '20000', $neighborhood = 'Quartier Palmier', $street = '123 Rue des Parfums')
    {
        \App\Models\Address::create([
            'user_id' => $user->id,
            'city' => $city,
            'neighborhood' => $neighborhood,
            'full_address' => $street . ', Résidence Luxe, Apt ' . rand(1, 20),
            'zip_code' => $zip,
            'country' => 'Maroc',
            'is_default' => true
        ]);
    }
}

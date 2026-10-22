<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            LocationSeeder::class,
            LessonPackageSeeder::class,
        ]);

        // Seed Eigenaar (Owner) out of the box
        User::create([
            'name' => 'Terence Olieslager',
            'email' => 'terence@windkracht12.nl',
            'password' => Hash::make('Eigenaar@1234'),
            'role' => 'owner',
            'is_active' => true,
            'address' => 'Oudegracht 12',
            'city' => 'Utrecht',
            'birth_date' => '1980-05-12',
            'phone' => '0611223344',
            'bsn' => '123456789',
        ]);

        // Seed 5 Instructors
        $instructors = [
            ['name' => 'Duco Veenstra', 'email' => 'duco@windkracht12.nl'],
            ['name' => 'Waldemar van Dongen', 'email' => 'waldemar@windkracht12.nl'],
            ['name' => 'Ruud Terlingen', 'email' => 'ruud@windkracht12.nl'],
            ['name' => 'Saskia Brink', 'email' => 'saskia@windkracht12.nl'],
            ['name' => 'Bernie Vredenstein', 'email' => 'bernie@windkracht12.nl'],
        ];

        foreach ($instructors as $inst) {
            User::create([
                'name' => $inst['name'],
                'email' => $inst['email'],
                'password' => Hash::make('Instructeur@12'),
                'role' => 'instructor',
                'is_active' => true,
                'address' => 'Surfsingel 100',
                'city' => 'Zandvoort',
                'birth_date' => '1990-08-20',
                'phone' => '0698765432',
                'bsn' => '987654321',
            ]);
        }

        // Seed a default Customer for testing
        User::create([
            'name' => 'Kees Klant',
            'email' => 'kees@test.com',
            'password' => Hash::make('Wachtwoord@12'),
            'role' => 'customer',
            'is_active' => true,
            'address' => 'Strandweg 5',
            'city' => 'Scheveningen',
            'birth_date' => '1995-02-15',
            'phone' => '0655667788',
        ]);
    }
}

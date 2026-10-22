<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LessonPackage;

class LessonPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LessonPackage::insert([
            [
                'name'         => 'Privéles (2,5 uur)',
                'price'        => 175.00,
                'hours'        => 2.5,
                'lesson_count' => 1,
                'max_people'   => 1,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Losse Duo Kiteles (3,5 uur)',
                'price'        => 135.00,
                'hours'        => 3.5,
                'lesson_count' => 1,
                'max_people'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Kitesurf Duo lespakket (3 lessen)',
                'price'        => 375.00,
                'hours'        => 10.5,
                'lesson_count' => 3,
                'max_people'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Kitesurf Duo lespakket (5 lessen)',
                'price'        => 675.00,
                'hours'        => 17.5,
                'lesson_count' => 5,
                'max_people'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }
}

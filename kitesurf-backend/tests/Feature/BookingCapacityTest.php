<?php

namespace Tests\Feature;

use App\Models\LessonPackage;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\ReservationLesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingCapacityTest extends TestCase
{
    use RefreshDatabase;

    public function test_duo_booking_assigns_an_instructor_and_fills_the_daypart_capacity(): void
    {
        Mail::fake();
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $instructor = User::factory()->create(['role' => 'instructor', 'is_active' => true]);
        $location = Location::query()->forceCreate(['name' => 'Zandvoort']);
        $duoPackage = LessonPackage::create([
            'name' => 'Duo les',
            'price' => 100,
            'hours' => 2,
            'lesson_count' => 1,
            'max_people' => 2,
        ]);
        $soloPackage = LessonPackage::create([
            'name' => 'Priveles',
            'price' => 75,
            'hours' => 2,
            'lesson_count' => 1,
            'max_people' => 1,
        ]);
        $lessonDate = now()->addDays(3)->toDateString();
        Sanctum::actingAs($customer);

        $this->postJson('/api/reservations', [
            'package_id' => $duoPackage->id,
            'location_id' => $location->id,
            'lesson_dates' => [$lessonDate],
            'daypart' => 'ochtend',
            'start_time' => '09:00',
        ])
            ->assertCreated()
            ->assertJsonPath('reservation.instructor.id', $instructor->id)
            ->assertJsonPath('reservation.lessons.0.daypart', 'ochtend')
            ->assertJsonPath('reservation.lessons.0.start_time', '09:00');

        $occupiedPlaces = DB::table('reservation_lessons')
            ->join('reservations', 'reservations.id', '=', 'reservation_lessons.reservation_id')
            ->join('lesson_packages', 'lesson_packages.id', '=', 'reservations.package_id')
            ->where('reservations.instructor_id', $instructor->id)
            ->whereDate('reservation_lessons.lesson_date', $lessonDate)
            ->where('reservation_lessons.daypart', 'ochtend')
            ->where('reservation_lessons.status', '!=', 'geannuleerd')
            ->where('reservations.status', '!=', 'geannuleerd')
            ->sum('lesson_packages.max_people');
        $this->assertSame(2, (int) $occupiedPlaces);

        $this->postJson('/api/reservations', [
            'package_id' => $soloPackage->id,
            'location_id' => $location->id,
            'lesson_dates' => [$lessonDate],
            'daypart' => 'ochtend',
            'start_time' => '09:00',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('lesson_dates');

        $this->assertSame(1, Reservation::count());
    }

    public function test_customer_cannot_book_the_same_date_and_daypart_twice(): void
    {
        Mail::fake();
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        User::factory()->create(['role' => 'instructor', 'is_active' => true]);
        User::factory()->create(['role' => 'instructor', 'is_active' => true]);
        $location = Location::query()->forceCreate(['name' => 'Zandvoort']);
        $package = LessonPackage::create([
            'name' => 'Priveles',
            'price' => 75,
            'hours' => 2,
            'lesson_count' => 1,
            'max_people' => 1,
        ]);
        $lessonDate = now()->addDays(3)->toDateString();
        Sanctum::actingAs($customer);

        $booking = [
            'package_id' => $package->id,
            'location_id' => $location->id,
            'lesson_dates' => [$lessonDate],
            'daypart' => 'ochtend',
            'start_time' => '09:00',
        ];

        $this->postJson('/api/reservations', $booking)->assertCreated();
        $this->postJson('/api/reservations', [
            ...$booking,
            'start_time' => '13:00',
        ])->assertUnprocessable()->assertJsonValidationErrors('start_time');

        $this->postJson('/api/reservations', $booking)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('lesson_dates')
            ->assertJsonPath('errors.lesson_dates.0', 'Je hebt al een les geboekt op deze datum en dit tijdstip. Kies een ander moment.');

        $this->postJson('/api/reservations', [
            ...$booking,
            'start_time' => '10:00',
        ])->assertCreated();

        $this->assertSame(2, Reservation::count());
    }

    public function test_owner_can_read_most_booked_locations_and_packages(): void
    {
        $owner = User::factory()->create(['role' => 'owner', 'is_active' => true]);
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $location = Location::query()->forceCreate(['name' => 'Muiderberg']);
        $package = LessonPackage::create([
            'name' => 'Vijf lessen',
            'price' => 250,
            'hours' => 2,
            'lesson_count' => 5,
            'max_people' => 1,
        ]);
        $reservation = Reservation::create([
            'customer_id' => $customer->id,
            'package_id' => $package->id,
            'location_id' => $location->id,
            'status' => 'voorlopig',
            'payment_status' => 'openstaand',
            'total_price' => 250,
        ]);
        ReservationLesson::create([
            'reservation_id' => $reservation->id,
            'lesson_date' => now()->addDays(3)->toDateString(),
            'daypart' => 'middag',
        ]);

        Sanctum::actingAs($owner);

        $this->getJson('/api/owner/booking-stats')
            ->assertOk()
            ->assertJsonPath('popular_locations.0.name', 'Muiderberg')
            ->assertJsonPath('popular_locations.0.bookings_count', 1)
            ->assertJsonPath('popular_packages.0.name', 'Vijf lessen')
            ->assertJsonPath('popular_packages.0.bookings_count', 1);
    }
}

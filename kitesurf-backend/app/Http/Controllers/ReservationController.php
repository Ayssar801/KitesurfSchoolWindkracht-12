<?php

namespace App\Http\Controllers;

// Importeer models, mailables en Laravel facades/helpers voor boekingen en lessen
use App\Models\User;
use App\Models\LessonPackage;
use App\Models\Reservation;
use App\Models\ReservationLesson;
use App\Models\DuoParticipant;
use App\Mail\ReservationMail;
use App\Mail\LessonCancellationMail;
use App\Mail\ReservationFinalizedMail;
use App\Mail\LessonRescheduledMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

// Controller voor alle reserverings- en lesgerelateerde acties
class ReservationController extends Controller
{
    private function startTimesForDaypart(string $daypart): array
    {
        $hours = $daypart === 'ochtend' ? range(9, 11) : range(12, 17);

        return array_map(fn (int $hour) => sprintf('%02d:00', $hour), $hours);
    }

    private function ensureCustomerHasNoDuplicateLesson(
        int $customerId,
        array $lessonDates,
        string $startTime,
        string $errorField,
        ?int $excludeLessonId = null
    ): void {
        foreach ($lessonDates as $lessonDate) {
            $alreadyBooked = ReservationLesson::query()
                ->whereDate('lesson_date', $lessonDate)
                ->where('start_time', $startTime)
                ->where('status', '!=', 'geannuleerd')
                ->whereHas('reservation', function ($query) use ($customerId) {
                    $query->where('customer_id', $customerId)
                        ->where('status', '!=', 'geannuleerd');
                })
                ->when($excludeLessonId !== null, fn ($query) => $query->where('id', '!=', $excludeLessonId))
                ->exists();

            if ($alreadyBooked) {
                throw ValidationException::withMessages([
                    $errorField => 'Je hebt al een les geboekt op deze datum en dit tijdstip. Kies een ander moment.',
                ]);
            }
        }
    }

    private function availableInstructor(
        array $lessonDates,
        string $daypart,
        string $startTime,
        int $participants,
        ?int $preferredInstructorId = null,
        ?int $excludeReservationId = null,
        ?int $excludeLessonId = null
    ): ?User {
        $instructorsQuery = User::query()
            ->where('role', 'instructor')
            ->where('is_active', true)
            ->orderBy('id');

        if ($preferredInstructorId !== null) {
            $instructorsQuery->whereKey($preferredInstructorId);
        }

        foreach ($instructorsQuery->lockForUpdate()->get() as $instructor) {
            $hasCapacity = true;

            foreach ($lessonDates as $lessonDate) {
                $occupiedPlaces = ReservationLesson::query()
                    ->join('reservations', 'reservations.id', '=', 'reservation_lessons.reservation_id')
                    ->join('lesson_packages', 'lesson_packages.id', '=', 'reservations.package_id')
                    ->where('reservations.instructor_id', $instructor->id)
                    ->whereDate('reservation_lessons.lesson_date', $lessonDate)
                    ->where('reservation_lessons.start_time', $startTime)
                    ->where('reservation_lessons.status', '!=', 'geannuleerd')
                    ->where('reservations.status', '!=', 'geannuleerd')
                    ->when($excludeReservationId !== null, fn ($query) => $query->where('reservations.id', '!=', $excludeReservationId))
                    ->when($excludeLessonId !== null, fn ($query) => $query->where('reservation_lessons.id', '!=', $excludeLessonId))
                    ->sum('lesson_packages.max_people');

                if ($occupiedPlaces + $participants > 2) {
                    $hasCapacity = false;
                    break;
                }
            }

            if ($hasCapacity) {
                return $instructor;
            }
        }

        return null;
    }

    // Hulpfunctie om te controleren of de ingelogde gebruiker toegang heeft tot een reservering
    private function hasAccess(Request $request, Reservation $res): bool
    {
        $user = $request->user();
        return $user->role === 'owner' || 
            ($user->role === 'instructor' && ($res->instructor_id === $user->id || $res->customer->instructor_id === $user->id));
    }

    public function getBookingStats(Request $request)
    {
        if ($request->user()->role !== 'owner') {
            return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        }

        $baseQuery = Reservation::query()->where('status', '!=', 'geannuleerd');

        $popularLocations = (clone $baseQuery)
            ->join('locations', 'locations.id', '=', 'reservations.location_id')
            ->select('locations.id', 'locations.name')
            ->selectRaw('COUNT(reservations.id) as bookings_count')
            ->groupBy('locations.id', 'locations.name')
            ->orderByDesc('bookings_count')
            ->orderBy('locations.name')
            ->limit(5)
            ->get();

        $popularPackages = (clone $baseQuery)
            ->join('lesson_packages', 'lesson_packages.id', '=', 'reservations.package_id')
            ->select('lesson_packages.id', 'lesson_packages.name')
            ->selectRaw('COUNT(reservations.id) as bookings_count')
            ->groupBy('lesson_packages.id', 'lesson_packages.name')
            ->orderByDesc('bookings_count')
            ->orderBy('lesson_packages.name')
            ->limit(5)
            ->get();

        return response()->json([
            'popular_locations' => $popularLocations,
            'popular_packages' => $popularPackages,
        ]);
    }

    // Nieuwe reservering en bijbehorende lessen opslaan
    public function store(Request $request)
    {
        $package = LessonPackage::findOrFail($request->package_id);
        $user = $request->user();
        $isStaff = in_array($user->role, ['instructor', 'owner']);

        $rules = [
            'package_id'     => 'required|exists:lesson_packages,id',
            'location_id'    => 'required|exists:locations,id',
            'lesson_dates'   => 'required|array|size:' . $package->lesson_count,
            'lesson_dates.*' => 'required|date|after:today|distinct',
            'daypart'        => 'required|in:ochtend,middag',
            'start_time'     => ['required', 'in:' . implode(',', $this->startTimesForDaypart((string) $request->input('daypart')))],
            'duo_name'       => 'nullable|string|max:255',
            'duo_email'      => 'nullable|email|max:255',
            'duo_address'    => 'nullable|string|max:255',
            'duo_city'       => 'nullable|string|max:255',
            'duo_phone'      => 'nullable|string|max:255',
        ];
        if ($isStaff) {
            $rules['customer_id'] = 'required|exists:users,id';
            if ($user->role === 'owner') $rules['instructor_id'] = 'nullable|exists:users,id';
        }
        $request->validate($rules);

        if ($package->max_people > 1 && $request->filled('duo_name') && !$request->filled(['duo_email', 'duo_address', 'duo_city', 'duo_phone'])) {
            return response()->json(['message' => 'Alle NAW-gegevens van de duo-deelnemer zijn verplicht.'], 422);
        }

        // Bepaal statussen op basis van rol: medewerkers boeken definitief, klanten voorlopig
        $customerId = $isStaff ? $request->customer_id : $user->id;
        $status = $isStaff ? 'definitief' : 'voorlopig';
        $paymentStatus = $isStaff ? 'betaald' : 'openstaand';
        $preferredInstructorId = $user->role === 'instructor'
            ? $user->id
            : ($isStaff ? $request->input('instructor_id') : null);

        $reservation = DB::transaction(function () use ($request, $package, $customerId, $status, $paymentStatus, $isStaff, $preferredInstructorId) {
            User::query()->whereKey($customerId)->lockForUpdate()->firstOrFail();
            $this->ensureCustomerHasNoDuplicateLesson(
                (int) $customerId,
                $request->lesson_dates,
                $request->start_time,
                'lesson_dates'
            );

            $instructor = $this->availableInstructor(
                $request->lesson_dates,
                $request->daypart,
                $request->start_time,
                $package->max_people,
                $preferredInstructorId ? (int) $preferredInstructorId : null
            );

            if (!$instructor) {
                throw ValidationException::withMessages([
                    'lesson_dates' => 'Er is geen instructeur beschikbaar voor alle gekozen datums en dagdelen. Kies een ander moment.',
                ]);
            }

            $res = Reservation::create([
                'customer_id'       => $customerId,
                'package_id'        => $request->package_id,
                'location_id'       => $request->location_id,
                'status'            => $status,
                'payment_status'    => $paymentStatus,
                'payment_submitted' => $isStaff,
                'instructor_id'     => $instructor->id,
                'total_price'       => $package->price,
            ]);

            foreach ($request->lesson_dates as $date) {
                ReservationLesson::create([
                    'reservation_id' => $res->id,
                    'lesson_date'    => $date,
                    'daypart'        => $request->daypart,
                    'start_time'     => $request->start_time,
                    'status'         => 'gepland',
                ]);
            }

            if ($package->max_people > 1 && $request->filled('duo_name')) {
                DuoParticipant::create([
                    'reservation_id' => $res->id,
                    'name'           => $request->duo_name,
                    'address'        => $request->duo_address,
                    'city'           => $request->duo_city,
                    'phone'          => $request->duo_phone,
                ]);
            }
            return $res;
        });

        $reservation->load('lessons', 'package', 'location', 'customer', 'duoParticipant', 'instructor');
        try {
            $mail = Mail::to($reservation->customer->email);
            if ($request->filled('duo_email')) $mail->cc($request->duo_email);
            $mail->send(new ReservationMail($reservation));

            if ($reservation->status === 'definitief' && $reservation->instructor_id) {
                Log::info('Instructeur is direct toegewezen, verstuur e-mail naar: ' . $reservation->instructor->email);
                sleep(10); // Voorkom Mailtrap rate-limiting
                Mail::to($reservation->instructor->email)->send(new ReservationFinalizedMail($reservation, 'instructor'));
                Log::info('E-mail succesvol verzonden naar instructeur (direct)');
            }
        } catch (\Exception $e) {
            Log::error('Fout bij verzenden boeking e-mail: ' . $e->getMessage());
            return response()->json(['message' => 'Reservering aangemaakt, maar e-mail verzenden mislukt: ' . $e->getMessage()], 500);
        }
        return response()->json(['message' => 'Reservering succesvol aangemaakt.', 'reservation' => $reservation], 201);
    }

    // Eigen reserveringen ophalen (Klant)
    public function index(Request $request)
    {
        return response()->json(
            Reservation::with(['package', 'location', 'lessons', 'instructor', 'duoParticipant'])
                ->where('customer_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    // Lesdatum annuleren door klant met verplichte opgave van een nieuwe inhaalsdatum
    public function cancel(Request $request, int $id)
    {
        $request->validate([
            'lesson_id' => 'required|exists:reservation_lessons,id',
            'reason'    => 'required|string|min:10',
            'new_date'  => 'nullable|date|after:today',
            'new_time'  => 'nullable|date_format:H:i',
        ]);
        $reservation = Reservation::where(['id' => $id, 'customer_id' => $request->user()->id])->firstOrFail();
        if ($reservation->status === 'geannuleerd') return response()->json(['message' => 'Deze reservering is al geannuleerd.'], 422);

        $lesson = ReservationLesson::where(['id' => $request->lesson_id, 'reservation_id' => $reservation->id])->firstOrFail();
        if ($lesson->status === 'geannuleerd') return response()->json(['message' => 'Deze les is al geannuleerd.'], 422);

        $newLesson = DB::transaction(function () use ($request, $reservation, $lesson) {
            if ($request->filled('new_date')) {
                $startTime = $request->input('new_time', substr((string) $lesson->start_time, 0, 5));
                $request->merge(['new_time' => $startTime]);
                $request->validate([
                    'new_time' => ['required', 'in:' . implode(',', $this->startTimesForDaypart($lesson->daypart))],
                ]);
                User::query()->whereKey($reservation->customer_id)->lockForUpdate()->firstOrFail();
                $this->ensureCustomerHasNoDuplicateLesson(
                    (int) $reservation->customer_id,
                    [$request->new_date],
                    $startTime,
                    'new_date',
                    $lesson->id
                );
            }

            if ($request->filled('new_date') && $reservation->instructor_id) {
                $instructor = $this->availableInstructor(
                    [$request->new_date],
                    $lesson->daypart,
                    $request->new_time,
                    $reservation->package->max_people,
                    $reservation->instructor_id,
                    $reservation->id,
                    $lesson->id
                );
                if (!$instructor) {
                    throw ValidationException::withMessages([
                        'new_date' => 'Er is op deze datum en dit tijdstip geen plek meer bij je instructeur.',
                    ]);
                }
            }

            $lesson->update(['status' => 'geannuleerd', 'cancellation_reason' => $request->reason]);
            $newLesson = null;
            if ($request->filled('new_date')) {
                $newLesson = ReservationLesson::create([
                    'reservation_id' => $reservation->id,
                    'lesson_date' => $request->new_date,
                    'daypart' => $lesson->daypart,
                    'start_time' => $request->new_time ?? $lesson->start_time,
                    'status' => 'gepland',
                ]);
            }

            if ($reservation->lessons()->where('status', '!=', 'geannuleerd')->doesntExist()) {
                $reservation->update(['status' => 'geannuleerd', 'reason_cancelled' => $request->reason]);
            }

            return $newLesson;
        });

        try {
            Mail::to($reservation->customer->email)->send(new LessonCancellationMail($lesson, $request->reason, 'customer'));
            
            if ($reservation->instructor_id) {
                sleep(10);
                Mail::to($reservation->instructor->email)->send(new LessonCancellationMail($lesson, $request->reason, 'customer', 'instructor'));
            }
        } catch (\Exception $e) {
            Log::error('Fout bij verzenden annulering e-mail: ' . $e->getMessage());
        }

        $responseData = [
            'message'     => $newLesson ? 'Les geannuleerd. Nieuwe les aangemaakt op ' . $request->new_date . '.' : 'Les succesvol geannuleerd.',
            'lesson'      => $lesson,
            'reservation' => $reservation->fresh('lessons'),
        ];
        if ($newLesson) {
            $responseData['new_lesson'] = $newLesson;
        }
        return response()->json($responseData);
    }

    // Melding dat bedrag is overgemaakt door de klant
    public function confirmPaymentSent(Request $request, int $id)
    {
        $reservation = Reservation::where(['id' => $id, 'customer_id' => $request->user()->id])->firstOrFail();
        $reservation->update(['payment_submitted' => true]);
        return response()->json(['message' => 'Betalingsmelding succesvol doorgegeven.', 'reservation' => $reservation]);
    }

    // Onbetaalde reserveringen inzien (Eigenaar)
    public function getUnpaid(Request $request)
    {
        if ($request->user()->role !== 'owner') return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        return response()->json(Reservation::with(['customer', 'package', 'location', 'lessons', 'duoParticipant'])
            ->where('payment_status', 'openstaand')
            ->orderBy('payment_submitted', 'desc')
            ->orderBy('created_at', 'desc')->get());
    }

    // Reservering definitief maken en instructeur toewijzen (Eigenaar)
    public function finalizePayment(Request $request, int $id)
    {
        if ($request->user()->role !== 'owner') return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        $request->validate(['instructor_id' => 'required|exists:users,id']);

        $reservation = DB::transaction(function () use ($request, $id) {
            $reservation = Reservation::with(['package', 'lessons'])->lockForUpdate()->findOrFail($id);
            $instructor = $this->availableInstructor(
                $reservation->lessons->where('status', '!=', 'geannuleerd')->pluck('lesson_date')->map(fn ($date) => $date->toDateString())->all(),
                $reservation->lessons->first()?->daypart ?? 'ochtend',
                substr((string) ($reservation->lessons->first()?->start_time ?? '09:00'), 0, 5),
                $reservation->package->max_people,
                (int) $request->instructor_id,
                $reservation->id
            );

            if (!$instructor) {
                throw ValidationException::withMessages([
                    'instructor_id' => 'Deze instructeur heeft niet genoeg plek op alle lesdatums.',
                ]);
            }

            $reservation->update([
                'status' => 'definitief',
                'payment_status' => 'betaald',
                'instructor_id' => $instructor->id,
            ]);

            return $reservation;
        });
        $reservation->load(['customer', 'package', 'location', 'lessons', 'instructor', 'duoParticipant']);

        try {
            Mail::to($reservation->customer->email)->send(new ReservationFinalizedMail($reservation));
            Log::info('E-mail verzonden naar klant: ' . $reservation->customer->email);
            sleep(10); // Voorkom Mailtrap rate-limiting
            Log::info('Bezig met verzenden naar instructeur: ' . $reservation->instructor->email);
            Mail::to($reservation->instructor->email)->send(new ReservationFinalizedMail($reservation, 'instructor'));
            Log::info('E-mail succesvol verzonden naar instructeur');
        } catch (\Exception $e) {
            Log::error('Fout bij verzenden afrondings e-mails: ' . $e->getMessage());
            return response()->json(['message' => 'Reservering definitief, maar e-mail verzenden mislukt: ' . $e->getMessage()], 500);
        }
        return response()->json(['message' => 'Reservering definitief gemaakt.', 'reservation' => $reservation]);
    }

    // Lesplanning ophalen (Instructeur / Eigenaar)
    public function getInstructorLessons(Request $request)
    {
        $user = $request->user();
        $instructorId = $user->id;
        if ($user->role === 'owner') {
            $request->validate(['instructor_id' => 'required|exists:users,id']);
            $instructorId = $request->instructor_id;
        } elseif ($user->role !== 'instructor') {
            return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        }

        return response()->json(ReservationLesson::with(['reservation.customer', 'reservation.package', 'reservation.location', 'reservation.instructor'])
            ->whereHas('reservation', fn($q) => $q->where('instructor_id', $instructorId))
            ->orderBy('lesson_date', 'asc')->get());
    }

    // Les annuleren door Instructeur/Eigenaar wegens ziekte of weersomstandigheden
    public function cancelByInstructor(Request $request, int $id)
    {
        $request->validate(['type' => 'required|in:illness,weather', 'reason' => 'required|string|min:10']);
        $lesson = ReservationLesson::findOrFail($id);
        if ($lesson->status === 'geannuleerd') return response()->json(['message' => 'Deze les is al geannuleerd.'], 422);

        $lesson->update(['status' => 'geannuleerd', 'cancellation_reason' => $request->reason]);
        $reservation = $lesson->reservation;
        if ($reservation->lessons()->where('status', '!=', 'geannuleerd')->doesntExist()) {
            $reservation->update(['status' => 'geannuleerd', 'reason_cancelled' => $request->reason]);
        }

        $lesson->load('reservation.customer');
        try {
            $type = $request->type === 'illness' ? 'instructor_illness' : 'bad_weather';
            $mail = Mail::to($lesson->reservation->customer->email);
            $mail->cc('info@windkracht12.nl');
            $mail->send(new LessonCancellationMail($lesson, $request->reason, $type));
        } catch (\Exception $e) {
            Log::error('Fout bij verzenden annulering e-mail: ' . $e->getMessage());
        }
        return response()->json(['message' => 'Les geannuleerd.', 'lesson' => $lesson]);
    }

    // Reserveringen van een specifieke klant bekijken
    public function getCustomerReservations(Request $request, int $customerId)
    {
        $user = $request->user();
        if ($user->role === 'instructor') {
            $assigned = Reservation::where(['instructor_id' => $user->id, 'customer_id' => $customerId])->exists();
            $createdBy = User::where(['id' => $customerId, 'instructor_id' => $user->id])->exists();
            if (!$assigned && !$createdBy) return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        } elseif ($user->role !== 'owner') {
            return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        }

        return response()->json(Reservation::with(['package', 'location', 'lessons', 'instructor', 'duoParticipant'])
            ->where('customer_id', $customerId)->orderBy('created_at', 'desc')->get());
    }

    // Lesdatum verplaatsen door instructeur of eigenaar
    public function rescheduleLesson(Request $request, int $id)
    {
        $request->validate(['lesson_date' => 'required|date', 'start_time' => 'required|date_format:H:i']);
        $lesson = ReservationLesson::findOrFail($id);
        
        $oldDate = $lesson->lesson_date;

        if ($request->user()->role !== 'owner' && $lesson->reservation->instructor_id !== $request->user()->id) {
            return response()->json(['message' => 'Niet geautoriseerd.'], 403);
        }

        DB::transaction(function () use ($request, $lesson) {
            $request->validate([
                'start_time' => ['required', 'in:' . implode(',', $this->startTimesForDaypart($lesson->daypart))],
            ]);
            User::query()->whereKey($lesson->reservation->customer_id)->lockForUpdate()->firstOrFail();
            $this->ensureCustomerHasNoDuplicateLesson(
                (int) $lesson->reservation->customer_id,
                [$request->lesson_date],
                $request->start_time,
                'lesson_date',
                $lesson->id
            );

            if ($lesson->reservation->instructor_id) {
                $instructor = $this->availableInstructor(
                    [$request->lesson_date],
                    $lesson->daypart,
                    $request->start_time,
                    $lesson->reservation->package->max_people,
                    $lesson->reservation->instructor_id,
                    $lesson->reservation->id,
                    $lesson->id
                );
                if (!$instructor) {
                    throw ValidationException::withMessages([
                        'lesson_date' => 'Er is op deze datum en dit tijdstip geen plek meer bij deze instructeur.',
                    ]);
                }
            }

            $lesson->update(['lesson_date' => $request->lesson_date, 'start_time' => $request->start_time, 'status' => 'gepland']);
        });
        $lesson->load('reservation.customer', 'reservation.instructor', 'reservation.location', 'reservation.package');

        try {
            Mail::to($lesson->reservation->customer->email)->send(new LessonRescheduledMail($lesson, $oldDate));
            
            if ($lesson->reservation->instructor_id) {
                sleep(10);
                Mail::to($lesson->reservation->instructor->email)->send(new LessonRescheduledMail($lesson, $oldDate, 'instructor'));
            }
        } catch (\Exception $e) {
            Log::error('Fout bij verzenden reschedule e-mail: ' . $e->getMessage());
            return response()->json(['message' => 'Les verplaatst, maar e-mail verzenden mislukt: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Les succesvol verplaatst.', 'lesson' => $lesson]);
    }

    // Reservering en bijbehorende lessen volledig verwijderen
    public function destroy(Request $request, int $id)
    {
        $res = Reservation::findOrFail($id);
        if (!$this->hasAccess($request, $res)) return response()->json(['message' => 'Niet geautoriseerd.'], 403);

        $res->delete();
        return response()->json(['message' => 'Reservering succesvol verwijderd.']);
    }
}

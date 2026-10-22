<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - KiteSurfSchool Windkracht-12
|--------------------------------------------------------------------------
*/

// ── Publieke routes ────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/activate', [AuthController::class, 'activate']);
Route::get('/packages', function() { return App\Models\LessonPackage::all(); });
Route::get('/locations', function() { return App\Models\Location::all(); });

// ── Beschermde routes (Sanctum token vereist) ─────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // ── Profiel & Wachtwoordbeheer (Elke ingelogde rol) ────────────────
    Route::get('/user/profile', [UserController::class, 'getProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);

    Route::apiResource('/users', UserController::class);
    Route::get('/users/{id}/reservations', [ReservationController::class, 'getCustomerReservations']);
    Route::patch('/lessons/{id}/reschedule', [ReservationController::class, 'rescheduleLesson']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

    // ── Owner: specifieke beheerfunctionaliteiten ─────────────────────
    Route::middleware('role:owner')->group(function () {
        Route::put('/owner/users/{id}/role', [UserController::class, 'updateRole']);
        Route::patch('/owner/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::get('/owner/unpaid-reservations', [ReservationController::class, 'getUnpaid']);
        Route::get('/owner/booking-stats', [ReservationController::class, 'getBookingStats']);
        Route::patch('/owner/reservations/{id}/finalize', [ReservationController::class, 'finalizePayment']);
    });

    // ── Instructor: planning & lessen ────────────────────────────────
    Route::middleware('role:instructor')->group(function () {
        Route::get('/instructor/lessons', [ReservationController::class, 'getInstructorLessons']);
        Route::patch('/lessons/{id}/instructor-cancel', [ReservationController::class, 'cancelByInstructor']);
    });

    // ── Customer: reserveren & eigen reserveringen ───────────────────
    Route::middleware('role:customer')->group(function () {
        // 6.1 Reservering maken
        Route::post('/reservations', [ReservationController::class, 'store']);

        // Eigen reserveringen ophalen
        Route::get('/reservations', [ReservationController::class, 'index']);

        // 6.3 Lesdatum annuleren (Door klant)
        Route::patch('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

        // Betaling doorgeven
        Route::patch('/reservations/{id}/confirm-payment', [ReservationController::class, 'confirmPaymentSent']);
    });
});

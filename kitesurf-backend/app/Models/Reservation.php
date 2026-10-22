<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'customer_id',
        'package_id',
        'location_id',
        'status',
        'payment_status',
        'payment_submitted',
        'instructor_id',
        'total_price',
        'reason_cancelled',
    ];

    // Relatie: reservering hoort bij een klant
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // Relatie: reservering hoort bij een instructeur
    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    // Relatie: reservering hoort bij een pakket
    public function package()
    {
        return $this->belongsTo(LessonPackage::class, 'package_id');
    }

    // Relatie: reservering hoort bij een locatie
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    // Relatie: reservering heeft één duo deelnemer
    public function duoParticipant()
    {
        return $this->hasOne(DuoParticipant::class);
    }

    // Relatie: reservering heeft meerdere lesdagen
    public function lessons()
    {
        return $this->hasMany(ReservationLesson::class);
    }
}

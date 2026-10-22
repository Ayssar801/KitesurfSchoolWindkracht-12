<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationLesson extends Model
{
    protected $fillable = [
        'reservation_id',
        'lesson_date',
        'daypart',
        'start_time',
        'status',
        'cancellation_reason',
    ];

    protected $casts = [
        'lesson_date' => 'date',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}

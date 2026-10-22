<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DuoParticipant extends Model
{
    protected $fillable = [
        'reservation_id',
        'name',
        'address',
        'city',
        'phone',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonPackage extends Model
{
    protected $fillable = [
        'name',
        'price',
        'hours',
        'lesson_count',
        'max_people',
    ];
}

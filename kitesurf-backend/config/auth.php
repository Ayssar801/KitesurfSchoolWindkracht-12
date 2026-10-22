<?php

use App\Models\User;

return [
    // Standaard authenticatie-instellingen
    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    // Gedefinieerde guards voor authenticatie
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    // User providers voor het ophalen van gebruikers
    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', User::class),
        ],

        // 'users' => [
    //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    // Instellingen voor het herstellen van wachtwoorden
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    // Time-out voor wachtwoordbevestigingsschermen
    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];

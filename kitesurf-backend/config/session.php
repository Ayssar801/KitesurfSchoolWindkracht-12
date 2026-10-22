<?php

use Illuminate\Support\Str;

return [
    // De standaard sessie-driver
    'driver' => env('SESSION_DRIVER', 'database'),

    // Levensduur van sessies in minuten
    'lifetime' => (int) env('SESSION_LIFETIME', 120),

    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    // Bepaalt of sessiedata versleuteld moet worden
    'encrypt' => env('SESSION_ENCRYPT', false),

    // Bestandslocatie voor file-gebaseerde sessies
    'files' => storage_path('framework/sessions'),

    // Databaseverbinding voor sessies
    'connection' => env('SESSION_CONNECTION'),

    // Databasetabel voor database-sessies
    'table' => env('SESSION_TABLE', 'sessions'),

    // Cache-store voor cache-gebaseerde sessies
    'store' => env('SESSION_STORE'),

    // Kans dat oude sessies worden opgeruimd
    'lottery' => [2, 100],

    // Naam van de sessie-cookie
    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug((string) env('APP_NAME', 'laravel')).'-session'
    ),

    // Beschikbaarheidspad van de sessie-cookie
    'path' => env('SESSION_PATH', '/'),

    // Beschikbaarheidsdomein van de sessie-cookie
    'domain' => env('SESSION_DOMAIN'),

    // Bepaalt of cookies alleen over HTTPS worden verzonden
    'secure' => env('SESSION_SECURE_COOKIE'),

    // Voorkomt dat JavaScript toegang heeft tot de cookie
    'http_only' => env('SESSION_HTTP_ONLY', true),

    // Instelling ter voorkoming van CSRF-aanvallen
    'same_site' => env('SESSION_SAME_SITE', 'lax'),

    // Bepaalt of de cookie gepartitioneerd is
    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

    // De serialisatie-strategie voor sessiedata
    'serialization' => 'json',

];

<?php

return [
    // De naam van de applicatie
    'name' => env('APP_NAME', 'Laravel'),

    // De actieve applicatie-omgeving (bijv. local of production)
    'env' => env('APP_ENV', 'production'),

    // Schakelt gedetailleerde foutmeldingen in
    'debug' => (bool) env('APP_DEBUG', false),

    // De URL van de applicatie (gebruikt voor console/artisan commands)
    'url' => env('APP_URL', 'http://localhost'),

    // De standaard tijdzone voor datumfuncties
    'timezone' => 'UTC',

    // De standaard taal- en lokalisatie-instellingen
    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    // De sleutel gebruikt door encryption-services
    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    // De driver voor het bepalen van de onderhoudsmodus
    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];

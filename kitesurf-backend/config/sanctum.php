<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;
use Laravel\Sanctum\Sanctum;

return [
    // Domeinen die stateful API-authenticatie-cookies ontvangen
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort(),
        // Sanctum::currentRequestHost(),
    ))),

    // Guards die worden gecontroleerd door Sanctum
    'guard' => ['web'],

    // Aantal minuten waarna een API-token verloopt
    'expiration' => null,

    // Prefix voor nieuw aangemaakte API-tokens
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    // Middleware die door Sanctum wordt gebruikt
    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],

];

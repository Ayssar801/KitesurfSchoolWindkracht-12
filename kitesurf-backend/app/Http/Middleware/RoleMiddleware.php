<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Controleert bij elk HTTP-verzoek of de ingelogde gebruiker wel de juiste rol heeft.
     *
     * Rollen in het systeem:
     *  - owner      → Heeft toegang tot alles
     *  - instructor → Toegang tot planning & toewijzen van lessen
     *  - customer   → Kan alleen eigen reserveringen maken en bekijken
     *
     * Gebruik in routes: ->middleware('role:owner') of ->middleware('role:owner,instructor')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // 1. Controleer of de gebruiker is ingelogd (er moet een Sanctum token zijn).
        if (! $user) {
            return response()->json([
                'message' => 'Niet geauthenticeerd.',
            ], 401);
        }

        // 2. Beheerder/Eigenaar (owner) heeft altijd en overal toegang toe, ongeacht de route restrictie.
        if ($user->role === 'owner') {
            return $next($request);
        }

        // 3. Controleer of de specifieke rol van de gebruiker voorkomt in de lijst van toegestane rollen.
        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Geen toegang. Jouw rol heeft geen toestemming voor deze actie.',
            ], 403);
        }

        // 4. Als alles klopt, mag het verzoek door naar de controller.
        return $next($request);
    }
}

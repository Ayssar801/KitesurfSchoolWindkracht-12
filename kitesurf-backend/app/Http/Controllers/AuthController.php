<?php

namespace App\Http\Controllers;

// Importeer benodigde models, mailables en Laravel facades/helpers
use App\Models\User;
use App\Models\LoginLog;
use App\Mail\ActivationMail;
use App\Mail\PasswordSetMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

// Controller voor alle authenticatie-gerelateerde acties: registreren, activeren, inloggen en uitloggen
class AuthController extends Controller
{
    // Schrijft een authenticatie-event (inloggen/uitloggen) weg naar een eigen logbestand
    private function logAuthEvent(string $email, string $action)
    {
        $time = now()->format('H:i:s.u');
        $date = now()->format('Y-m-d');
        $logMessage = sprintf("Tijd: %s | Datum: %s | E-mailadres: %s | Actie: %s\n", $time, $date, $email, strtoupper($action));
        @mkdir(storage_path('logs'), 0755, true);
        file_put_contents(storage_path('logs/auth.log'), $logMessage, FILE_APPEND);
    }

    // Registreert een inactieve klant en stuurt een activatielink per e-mail
    public function register(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
        ]);

        $activationToken = Str::random(40);

        // Voer registratie en mailverzending uit binnen een transactie
        $user = DB::transaction(function () use ($request, $activationToken) {
            $user = User::create([
                'name'             => $request->name,
                'email'            => $request->email,
                'password'         => Str::random(16),
                'role'             => 'customer',
                'is_active'        => false,
                'activation_token' => $activationToken,
            ]);

            Mail::to($user->email)->send(new ActivationMail($user, $activationToken));
            return $user;
        });

        return response()->json([
            'message' => 'Registratie succesvol. Activeer je account via de link in de e-mail.',
            'user'    => $user,
        ], 201);
    }

    // Activeert het account van de klant met een nieuw wachtwoord en genereert direct een API-token
    public function activate(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'password' => ['required', 'string', 'min:12', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/', 'confirmed']
        ], [
            'password.min' => 'Het wachtwoord moet minimaal 12 tekens lang zijn.',
            'password.regex' => 'Het wachtwoord moet ten minste één hoofdletter, één cijfer en één leesteken bevatten.',
        ]);

        $user = User::where('activation_token', $request->token)->first();

        if (!$user) {
            return response()->json(['message' => 'De activatiecode is ongeldig.'], 400);
        }

        // Activeer het account en wis het activatietoken
        $user->update([
            'is_active'        => true,
            'activation_token' => null,
            'password'         => $request->password,
        ]);

        try {
            Mail::to($user->email)->send(new PasswordSetMail($user));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Fout bij verzenden wachtwoord mail: ' . $e->getMessage());
        }

        // Registreer inlogactiviteit en genereer het API-token
        LoginLog::create(['user_id' => $user->id, 'action' => 'login', 'logged_at' => now()]);
        $this->logAuthEvent($user->email, 'login');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Account succesvol geactiveerd.',
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    // Handelt het inloggen af en retourneert een Sanctum API-token
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['De opgegeven inloggegevens zijn onjuist.']]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages(['email' => ['Je account is nog niet geactiveerd.']]);
        }

        // Registreer inlogactiviteit in de database en logs, en maak token aan
        LoginLog::create(['user_id' => $user->id, 'action' => 'login', 'logged_at' => now()]);
        $this->logAuthEvent($user->email, 'login');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Inloggen succesvol',
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    // Logt de gebruiker uit en verwijdert het actieve token
    public function logout(Request $request)
    {
        $user = $request->user();

        // Registreer uitlogactiviteit en trek het token in
        LoginLog::create(['user_id' => $user->id, 'action' => 'logout', 'logged_at' => now()]);
        $this->logAuthEvent($user->email, 'logout');

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Succesvol uitgelogd']);
    }
}

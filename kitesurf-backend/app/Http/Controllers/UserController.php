<?php

namespace App\Http\Controllers;

// Importeer benodigde models en Laravel classes/facades
use App\Models\User;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


// Controller voor alle gebruikersgerelateerde acties: profiel, wachtwoord en gebruikersbeheer
class UserController extends Controller
{
    // Haal ingelogde gebruiker op
    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    // Update ingelogde gebruikersprofiel (adres, telefoon, geboortedatum en eventueel BSN)
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $rules = [
            'name'       => 'required|string|max:255',
            'address'    => 'nullable|string|max:255',
            'city'       => 'nullable|string|max:255',
            'birth_date' => 'nullable|date|before:today',
            'phone'      => 'nullable|string|max:20',
        ];
        
        if (in_array($user->role, ['instructor', 'owner'])) {
            $rules['bsn'] = 'nullable|string|max:15';
        }
        
        $user->update($request->validate($rules));
        return response()->json(['message' => 'Profiel succesvol bijgewerkt.', 'user' => $user]);
    }

    // Wachtwoord wijzigen voor de ingelogde gebruiker met sterkte-validatie
    public function changePassword(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => ['required', 'string', 'min:12', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/', 'confirmed']
        ], [
            'new_password.min' => 'Het nieuwe wachtwoord moet minimaal 12 tekens lang zijn.',
            'new_password.regex' => 'Het nieuwe wachtwoord moet ten minste één hoofdletter, één cijfer en één leesteken bevatten.',
        ]);

        if (!Hash::check($request->old_password, $user->password)) {
            throw ValidationException::withMessages(['old_password' => ['Het huidige wachtwoord is onjuist.']]);
        }

        $user->update(['password' => $request->new_password]);
        return response()->json(['message' => 'Wachtwoord succesvol gewijzigd.']);
    }

    // Haalt een lijst van gebruikers op (eigenaar ziet alles, instructeur alleen toegewezen klanten)
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'owner') {
            $q = User::orderBy('name', 'asc');
            if ($request->filled('role')) $q->where('role', $request->role);
            return response()->json($q->get());
        }
        
        if ($user->role === 'instructor') {
            $assignedIds = Reservation::where('instructor_id', $user->id)->pluck('customer_id');
            return response()->json(User::where('role', 'customer')
                ->where(fn($q) => $q->whereIn('id', $assignedIds)->orWhere('instructor_id', $user->id))
                ->orderBy('name', 'asc')->get());
        }
        
        return response()->json(['message' => 'Niet geautoriseerd.'], 403);
    }

    // Specifieke gebruiker opvragen op basis van ID (met autorisatiecontrole)
    public function show(Request $request, int $id)
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($id);
        
        if ($currentUser->role === 'owner') {
            return response()->json($targetUser);
        }
        
        if ($currentUser->role === 'instructor') {
            $isAssigned = Reservation::where(['instructor_id' => $currentUser->id, 'customer_id' => $targetUser->id])->exists();
            if ($isAssigned || $targetUser->instructor_id === $currentUser->id) return response()->json($targetUser);
        }
        
        return response()->json(['message' => 'Niet geautoriseerd.'], 403);
    }

    // Gebruiker handmatig aanmaken via dashboard (door instructeur of eigenaar)
    public function store(Request $request)
    {
        $currentUser = $request->user();
        
        if ($currentUser->role === 'instructor' && $request->role !== 'customer') {
            return response()->json(['message' => 'Als instructeur mag je alleen klanten toevoegen.'], 403);
        }
        
        $rules = [
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => ['required', 'string', 'min:12', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/'],
            'role'       => 'required|in:customer,instructor',
            'address'    => 'nullable|string|max:255',
            'city'       => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone'      => 'nullable|string|max:20',
            'bsn'        => $request->role === 'instructor' ? 'required|string|max:15' : 'nullable|string|max:15',
        ];
        
        $validated = $request->validate($rules);
        $validated['password'] = $request->password;
        $validated['is_active'] = true;
        
        if ($currentUser->role === 'instructor') {
            $validated['instructor_id'] = $currentUser->id;
        }
        
        return response()->json(['message' => 'Gebruiker succesvol aangemaakt.', 'user' => User::create($validated)], 201);
    }

    // Bestaande gebruiker wijzigen (eigenaar wijzigt alles, instructeur alleen eigen klanten)
    public function update(Request $request, int $id)
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($id);

        if ($currentUser->role === 'instructor') {
            $isAssigned = Reservation::where(['instructor_id' => $currentUser->id, 'customer_id' => $targetUser->id])->exists();
            if (!$isAssigned && $targetUser->instructor_id !== $currentUser->id) {
                return response()->json(['message' => 'Niet geautoriseerd.'], 403);
            }
            if ($request->filled('role') && $request->role !== 'customer') {
                return response()->json(['message' => 'Als instructeur mag je de rol niet veranderen.'], 403);
            }
        }

        $rules = [
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email,' . $id,
            'address'    => 'nullable|string|max:255',
            'city'       => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone'      => 'nullable|string|max:20',
            'is_active'  => 'boolean',
        ];
        
        if ($currentUser->role === 'owner') {
            $rules['role'] = 'required|in:customer,instructor,owner';
            $rules['bsn'] = 'nullable|string|max:15';
        }
        
        $validated = $request->validate($rules);

        if ($request->filled('password')) {
            $request->validate(['password' => ['string', 'min:12', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[^A-Za-z0-9]/']]);
            $validated['password'] = $request->password;
        }

        $targetUser->update($validated);
        return response()->json(['message' => 'Gebruiker succesvol bijgewerkt.', 'user' => $targetUser]);
    }

    // Gebruikersrol wijzigen door Eigenaar
    public function updateRole(Request $request, int $id)
    {
        $request->validate(['role' => 'required|in:customer,instructor,owner']);
        $targetUser = User::findOrFail($id);
        $targetUser->update(['role' => $request->role]);
        return response()->json(['message' => 'Gebruikersrol succesvol gewijzigd.', 'user' => $targetUser]);
    }

    // Deblokkeren of blokkeren van gebruikersaccount
    public function toggleStatus(int $id)
    {
        $targetUser = User::findOrFail($id);
        $targetUser->update(['is_active' => !$targetUser->is_active]);
        $statusStr = $targetUser->is_active ? 'gedeblokkeerd' : 'geblokkeerd';
        return response()->json(['message' => "Gebruiker succesvol {$statusStr}.", 'user' => $targetUser]);
    }

    // Gebruiker of klant volledig verwijderen
    public function destroy(Request $request, int $id)
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($id);
        
        if ($currentUser->role === 'owner') {
            $targetUser->delete();
            return response()->json(['message' => 'Gebruiker succesvol verwijderd.']);
        }
        
        if ($currentUser->role === 'instructor') {
            $isAssigned = Reservation::where(['instructor_id' => $currentUser->id, 'customer_id' => $targetUser->id])->exists();
            if ($isAssigned || $targetUser->instructor_id === $currentUser->id) {
                $targetUser->delete();
                return response()->json(['message' => 'Klant succesvol verwijderd.']);
            }
        }
        
        return response()->json(['message' => 'Niet geautoriseerd.'], 403);
    }
}

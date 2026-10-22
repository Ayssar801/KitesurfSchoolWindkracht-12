<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Geactiveerd - Windkracht-12</title>
    <style>
        body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #ffffff;
            padding: 32px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
        }
        .header p {
            margin: 4px 0 0 0;
            font-size: 14px;
            color: #64748b;
        }
        .content {
            padding: 40px 32px;
            color: #334155;
            line-height: 1.6;
        }
        .content h2 {
            margin-top: 0;
            font-size: 20px;
            color: #0f172a;
            font-weight: 600;
        }
        .success-banner {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            color: #065f46;
        }
        .success-banner h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #047857;
        }
        .btn-container {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            background-color: #0ea5e9;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 8px;
            font-weight: 600;
            display: inline-block;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 4px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Geactiveerd!</h1>
            <p>KiteSurfSchool Windkracht-12</p>
        </div>
        <div class="content">
            <h2>Beste {{ $user->name }},</h2>
            
            <div class="success-banner">
                <h3>Goed nieuws! Je account is nu actief.</h3>
                <p>Je hebt zojuist succesvol je wachtwoord ingesteld en je account (rol: <strong>{{ $user->role === 'instructor' ? 'Instructeur' : ($user->role === 'owner' ? 'Eigenaar' : 'Klant') }}</strong>) is geverifieerd.</p>
            </div>

            <p>Vanaf nu kun je inloggen op ons platform om je lessen in te zien, te beheren of direct een nieuwe kitesurfles te boeken!</p>

            <div class="btn-container">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') . '/login' }}" class="btn">Inloggen op je Dashboard</a>
            </div>

            <p>Mocht je nog vragen hebben, neem dan gerust contact op. We zien je graag snel op het water!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Locatie: Zandvoort, Scheveningen, IJmuiden en meer.</p>
        </div>
    </div>
</body>
</html>

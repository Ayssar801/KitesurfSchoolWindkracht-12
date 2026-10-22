<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activeer jouw account - Windkracht-12</title>
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
            letter-spacing: -0.025em;
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
            <h1>KiteSurfSchool Windkracht-12</h1>
            <p>Ready to ride the wind</p>
        </div>
        <div class="content">
            <h2>Beste {{ $user->name }},</h2>
            <p>Welkom bij Kitesurfschool Windkracht-12!</p>
            <p>We vinden het geweldig dat je gekozen hebt om bij ons te leren kitesurfen. Je account is momenteel nog <strong>niet actief</strong>.</p>
            <p>Klik hieronder om je account te activeren en een wachtwoord in te stellen. Zodra je een wachtwoord instelt, is je account geactiveerd en klaar voor gebruik.</p>
            
            <div class="btn-container">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') . '/activate/' . $token }}" class="btn">Klik hier om je account te activeren</a>
            </div>

            <p style="font-size: 13px; color: #64748b; font-style: italic;">Let op: Deze link is 7 dagen geldig.</p>

            <p>Werkt de knop niet? Kopieer en plak dan de volgende link in je browser:</p>
            <p style="word-break: break-all; font-size: 13px; color: #0284c7;">
                {{ env('FRONTEND_URL', 'http://localhost:5173') . '/activate/' . $token }}
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Locatie: Zandvoort, Scheveningen, IJmuiden en meer.</p>
        </div>
    </div>
</body>
</html>

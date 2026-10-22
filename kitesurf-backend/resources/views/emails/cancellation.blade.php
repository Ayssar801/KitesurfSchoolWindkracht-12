<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Annulering Lesdatum - Windkracht-12</title>
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
        .info-box {
            background-color: #fff1f2;
            border: 1px solid #fecdd3;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #9f1239;
        }
        .info-box h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #881337;
        }
        .reason-box {
            background-color: #f8fafc;
            border-left: 4px solid #94a3b8;
            padding: 12px 16px;
            margin: 20px 0;
            font-style: italic;
            color: #475569;
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
            <h1>Lesdatum Geannuleerd</h1>
            <p>Reservering #{{ $lesson->reservation_id }}</p>
        </div>
        <div class="content">
            @if(isset($recipientType) && $recipientType === 'instructor')
                <h2>Beste {{ $lesson->reservation->instructor->name }},</h2>
            @else
                <h2>Beste {{ $lesson->reservation->customer->name }},</h2>
            @endif

            @if($cancelledBy === 'customer')
                @if(isset($recipientType) && $recipientType === 'instructor')
                    <p>De klant heeft zojuist een lesdatum geannuleerd in zijn/haar reservering:</p>
                @else
                    <p>Je hebt zojuist de volgende lesdatum geannuleerd in jouw reservering:</p>
                @endif
                <div class="info-box">
                    <h3>Geannuleerde Les:</h3>
                    <strong>Datum:</strong> {{ \Carbon\Carbon::parse($lesson->lesson_date)->locale('nl')->translatedFormat('l d F Y') }} om {{ \Carbon\Carbon::parse($lesson->start_time)->format('H:i') }} ({{ ucfirst($lesson->daypart) }})
                </div>
                <p>De opgegeven reden voor annulering is:</p>
                <div class="reason-box">
                    "{{ $reason }}"
                </div>
                @if(!isset($recipientType) || $recipientType !== 'instructor')
                    <p>Als je een nieuwe les wilt inplannen, neem dan contact met ons op of regel dit via je dashboard.</p>
                @endif
            @elseif($cancelledBy === 'instructor_illness' || $cancelledBy === 'bad_weather' || $cancelledBy === 'owner')
                @if($cancelledBy === 'instructor_illness')
                    <p>Helaas moeten we je informeren dat de onderstaande les is geannuleerd wegens plotselinge ziekte van de instructeur.</p>
                @elseif($cancelledBy === 'bad_weather')
                    <p>Veiligheid staat bij ons voorop! Vanwege slechte weersomstandigheden (zoals windkracht &gt; 10, storm of onweer) kan de onderstaande les helaas niet doorgaan.</p>
                @else
                    <p>De onderstaande geplande les is helaas geannuleerd.</p>
                @endif
                
                <div class="info-box" style="background-color: #f8fafc; border-color: #cbd5e1; color: #334155;">
                    <h3 style="color: #0f172a;">Details van de geannuleerde les:</h3>
                    <p style="margin: 4px 0;"><strong>Datum:</strong> {{ \Carbon\Carbon::parse($lesson->lesson_date)->locale('nl')->translatedFormat('l d F Y') }} om {{ \Carbon\Carbon::parse($lesson->start_time)->format('H:i') }} ({{ ucfirst($lesson->daypart) }})</p>
                    <p style="margin: 4px 0;"><strong>Locatie:</strong> {{ $lesson->reservation->location->name }}</p>
                    <p style="margin: 4px 0;"><strong>Instructeur:</strong> {{ $lesson->reservation->instructor ? $lesson->reservation->instructor->name : 'Nog niet toegewezen' }}</p>
                </div>

                <p>De opgegeven toelichting is:</p>
                <div class="reason-box">
                    "{{ $reason }}"
                </div>
                
                <p><strong>Wat nu?</strong><br>
                Je behoudt uiteraard het recht op deze les binnen je pakket. We nemen zo spoedig mogelijk contact met je op om een nieuwe les in te plannen, of je kunt zelf via je dashboard een nieuwe datum voorstellen.</p>
            @endif

        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Hulp nodig? Neem contact met ons op via info@windkracht12.nl.</p>
        </div>
    </div>
</body>
</html>

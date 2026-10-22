<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nieuwe Lesdatum Bevestigd - Windkracht-12</title>
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
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #166534;
        }
        .info-box h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #15803d;
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
            <h1>Les Verplaatst!</h1>
            <p>Reservering #{{ $lesson->reservation_id }}</p>
        </div>
        <div class="content">
            @if(isset($recipientType) && $recipientType === 'instructor')
                <h2>Beste {{ $lesson->reservation->instructor->name }},</h2>
                <p>Er is een nieuwe lesdatum ingepland voor een van je toegewezen reserveringen.</p>
            @else
                <h2>Beste {{ $lesson->reservation->customer->name }},</h2>
                <p>Goed nieuws! De wijziging voor je les is succesvol verwerkt en goedgekeurd.</p>
            @endif

            <div class="info-box">
                <h3>Nieuwe Lesdetails:</h3>
                <p style="margin: 4px 0;"><strong>Nieuwe Datum:</strong> {{ \Carbon\Carbon::parse($lesson->lesson_date)->locale('nl')->translatedFormat('l d F Y') }} om {{ \Carbon\Carbon::parse($lesson->start_time)->format('H:i') }} ({{ ucfirst($lesson->daypart) }})</p>
                <p style="margin: 4px 0;"><strong>Oude Datum was:</strong> <del>{{ \Carbon\Carbon::parse($oldDate)->locale('nl')->translatedFormat('l d F Y') }}</del></p>
                <p style="margin: 4px 0;"><strong>Locatie:</strong> {{ $lesson->reservation->location->name }}</p>
                <p style="margin: 4px 0;"><strong>Pakket:</strong> {{ $lesson->reservation->package->name }}</p>
            </div>

            @if(!isset($recipientType) || $recipientType !== 'instructor')
                <p>Je lespakket blijft uiteraard geldig en de geplande les valt binnen de voorwaarden van dit pakket.</p>
                <p>Als je verder nog andere lessen open hebt staan of wijzigingen wilt doorvoeren, kun je altijd terecht in je dashboard.</p>
            @else
                <p>Log in op je dashboard om je volledige actuele planning te bekijken.</p>
            @endif

        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Vragen? Neem contact met ons op via info@windkracht12.nl.</p>
        </div>
    </div>
</body>
</html>

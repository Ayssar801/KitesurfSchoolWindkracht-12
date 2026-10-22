<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betalingsherinnering - Windkracht-12</title>
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
        .warning-box {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            color: #9a3412;
        }
        .warning-box h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #7c2d12;
        }
        .payment-details {
            font-family: monospace;
            background-color: rgba(255, 255, 255, 0.6);
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            border: 1px dashed #fdba74;
            margin-top: 12px;
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
            <h1>Betalingsherinnering</h1>
            <p>Reservering #{{ $reservation->id }}</p>
        </div>
        <div class="content">
            <h2>Beste {{ $reservation->customer->name }},</h2>
            
            <p>We kijken er erg naar uit om met je het water op te gaan! We zien echter dat de betaling voor je kitesurflessen nog niet is verwerkt in onze administratie.</p>

            <div class="warning-box">
                <h3>Openstaande Betaling</h3>
                <p>Graag herinneren we je eraan dat de reservering pas definitief wordt zodra het bedrag is overgemaakt. Zonder tijdige betaling kunnen we je plek niet garanderen.</p>
                
                <div class="payment-details">
                    <strong>Ontvanger:</strong> Kitesurfschool Windkracht-12 B.V.<br>
                    <strong>IBAN:</strong> NL99 TRAS 0123 4567 89<br>
                    <strong>Bedrag:</strong> &euro;{{ number_format($reservation->total_price, 2, ',', '.') }}<br>
                    <strong>Kenmerk:</strong> Reservering #{{ $reservation->id }}
                </div>
            </div>

            <p>Heb je het bedrag zojuist overgemaakt? Dan mag je deze e-mail als niet verzonden beschouwen. Het kan soms een of twee werkdagen duren voordat de bankoverschrijving zichtbaar is.</p>

            <p>Mocht je nog vragen hebben of problemen ervaren met de betaling, neem dan gerust contact met ons op.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Locatie: Zandvoort, Scheveningen, IJmuiden en meer.</p>
        </div>
    </div>
</body>
</html>

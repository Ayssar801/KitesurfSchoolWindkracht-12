<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserveringsbevestiging & Factuur - Windkracht-12</title>
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
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
        }
        .details-table th, .details-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        .details-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
        }
        .dates-list {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        .dates-list h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #0369a1;
        }
        .dates-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .dates-list li {
            margin-bottom: 4px;
        }
        .payment-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            color: #14532d;
        }
        .payment-box h3 {
            margin-top: 0;
            font-size: 18px;
            color: #166534;
        }
        .payment-box p {
            margin: 8px 0;
        }
        .payment-details {
            font-family: monospace;
            background-color: rgba(255, 255, 255, 0.6);
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            border: 1px dashed #86efac;
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
            <h1>Reservering Ontvangen</h1>
            <p>Reserveringsnummer: #{{ $reservation->id }}</p>
        </div>
        <div class="content">
            <h2>Beste {{ $reservation->customer->name }},</h2>
            <p>Bedankt voor je reservering bij KiteSurfSchool Windkracht-12! We hebben je boekingsaanvraag succesvol ontvangen. Hieronder vind je de details van je reservering:</p>
            
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Omschrijving</th>
                        <th style="text-align: right;">Prijs</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>{{ $reservation->package->name }}</strong><br>
                            <span style="font-size: 13px; color: #64748b;">
                                Pakketduur: {{ $reservation->package->hours }} uur ({{ $reservation->package->lesson_count }} lessen)<br>
                                Locatie: {{ $reservation->location->name }}<br>
                                Instructeur: {{ $reservation->instructor?->name ?? 'Nog toe te wijzen' }}
                            </span>
                        </td>
                        <td style="text-align: right; vertical-align: top; font-weight: bold;">
                            &euro;{{ number_format($reservation->total_price, 2, ',', '.') }}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; border-top: 2px solid #cbd5e1;">Totaal:</td>
                        <td style="text-align: right; font-weight: bold; border-top: 2px solid #cbd5e1;">
                            &euro;{{ number_format($reservation->total_price, 2, ',', '.') }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="dates-list">
                <h3>Gekozen lesdata:</h3>
                <ul>
                    @foreach($reservation->lessons as $lesson)
                        <li>Les {{ $loop->iteration }}: {{ \Carbon\Carbon::parse($lesson->lesson_date)->locale('nl')->translatedFormat('l d F Y') }} om {{ \Carbon\Carbon::parse($lesson->start_time)->format('H:i') }} ({{ ucfirst($lesson->daypart) }})</li>
                    @endforeach
                </ul>
                @if($reservation->duoParticipant)
                    <h3 style="margin-top: 16px;">Duo-deelnemer:</h3>
                    <p style="margin: 0; font-size: 14px;"><strong>Naam:</strong> {{ $reservation->duoParticipant->name }}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Adres:</strong> {{ $reservation->duoParticipant->address ?? '-' }}, {{ $reservation->duoParticipant->city ?? '-' }}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Telefoon:</strong> {{ $reservation->duoParticipant->phone ?? '-' }}</p>
                @endif
            </div>

            <div class="payment-box">
                <h3>Belangrijk: Betalingsinstructies</h3>
                <p>Je reservering staat momenteel als <strong>voorlopig</strong> in ons systeem. Om je boeking definitief te maken, verzoeken wij je vriendelijk om het openstaande bedrag over te maken via bankoverschrijving:</p>
                
                <div class="payment-details">
                    <strong>Ontvanger:</strong> Kitesurfschool Windkracht-12 B.V.<br>
                    <strong>IBAN:</strong> NL99 TRAS 0123 4567 89<br>
                    <strong>Bedrag:</strong> &euro;{{ number_format($reservation->total_price, 2, ',', '.') }}<br>
                    <strong>Kenmerk:</strong> Reservering #{{ $reservation->id }}
                </div>
                
                <p style="font-size: 13px; margin-top: 16px; opacity: 0.9;">
                    * Zodra we de betaling hebben verwerkt, sturen we jou en je instructeur een definitieve bevestiging per e-mail.
                </p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Vragen over je boeking? Beantwoord deze e-mail of neem contact met ons op via info@windkracht12.nl.</p>
        </div>
    </div>
</body>
</html>

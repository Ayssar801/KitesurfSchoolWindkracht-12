<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betaling Ontvangen & Lessen Bevestigd - Windkracht-12</title>
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
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        .dates-list h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #15803d;
        }
        .dates-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .dates-list li {
            margin-bottom: 4px;
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
            <h1>Reservering Bevestigd!</h1>
            <p>Reserveringsnummer: #{{ $reservation->id }}</p>
        </div>
        <div class="content">
            @if(isset($recipientType) && $recipientType === 'instructor')
                <h2>Beste {{ $reservation->instructor->name }},</h2>
                
                <div class="success-banner" style="background-color: #eff6ff; border-color: #bfdbfe; color: #1e3a8a;">
                    <h3 style="color: #1d4ed8;">Nieuwe boeking toegewezen!</h3>
                    <p>Er is een betaling verwerkt voor een reservering en deze is aan jou toegewezen. De kitesurflessen gaan definitief door!</p>
                </div>

                <p>Hieronder vind je de details van de boeking en de klantgegevens:</p>
            @else
                <h2>Beste {{ $reservation->customer->name }},</h2>
                
                <div class="success-banner">
                    <h3>Goed nieuws! Je betaling is verwerkt.</h3>
                    <p>We hebben je betaling voor het lespakket succesvol ontvangen. Je reservering is nu officieel <strong>definitief</strong>. De kitesurflessen gaan definitief door!</p>
                </div>

                <p>Hieronder vind je de definitieve details van je boeking:</p>
            @endif
            
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Pakket / Locatie</th>
                        @if(isset($recipientType) && $recipientType === 'instructor')
                            <th>Klantgegevens</th>
                        @else
                            <th>Toegewezen Instructeur</th>
                        @endif
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>{{ $reservation->package->name }}</strong><br>
                            <span style="font-size: 13px; color: #64748b;">
                                Locatie: {{ $reservation->location->name }}
                            </span>
                        </td>
                        <td>
                            @if(isset($recipientType) && $recipientType === 'instructor')
                                <strong>{{ $reservation->customer->name }}</strong><br>
                                <span style="font-size: 13px; color: #64748b;">
                                    E-mail: {{ $reservation->customer->email }}<br>
                                    Tel: {{ $reservation->customer->phone ?? '-' }}
                                </span>
                            @else
                                <strong>{{ $reservation->instructor->name ?? 'Nog toe te wijzen' }}</strong><br>
                                <span style="font-size: 13px; color: #64748b;">
                                    Mobiel: {{ $reservation->instructor->phone ?? '-' }}
                                </span>
                            @endif
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="dates-list">
                @if(isset($recipientType) && $recipientType === 'instructor')
                    <h3>Lesdata van de klant:</h3>
                @else
                    <h3>Jouw lesdata:</h3>
                @endif
                <ul>
                    @foreach($reservation->lessons as $lesson)
                        <li>Les {{ $loop->iteration }}: {{ \Carbon\Carbon::parse($lesson->lesson_date)->locale('nl')->translatedFormat('l d F Y') }} om {{ \Carbon\Carbon::parse($lesson->start_time)->format('H:i') }} ({{ ucfirst($lesson->daypart) }}, status: {{ $lesson->status }})</li>
                    @endforeach
                </ul>
                @if($reservation->duoParticipant)
                    <h3 style="margin-top: 16px;">Duo-deelnemer:</h3>
                    <p style="margin: 0; font-size: 14px;"><strong>Naam:</strong> {{ $reservation->duoParticipant->name }}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Adres:</strong> {{ $reservation->duoParticipant->address ?? '-' }}, {{ $reservation->duoParticipant->city ?? '-' }}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Telefoon:</strong> {{ $reservation->duoParticipant->phone ?? '-' }}</p>
                @endif
            </div>

            @if(isset($recipientType) && $recipientType === 'instructor')
                <p>Zorg dat je op tijd aanwezig bent op de afgesproken locatie met de benodigde kitespullen. De klant is geïnformeerd om 15 minuten van tevoren aanwezig te zijn.</p>
                <p>Mocht je nog vragen hebben of contact willen opnemen met de klant, gebruik dan de bovenstaande contactgegevens.</p>
            @else
                <p>De instructeur ontmoet je op de afgesproken locatie. Zorg dat je 15 minuten van tevoren aanwezig bent en neem geschikte zwemkleding en een handdoek mee. Wetsuits, kites and boards worden door ons verzorgd!</p>
                <p>Mocht je nog vragen hebben, neem dan gerust contact op met je instructeur of beantwoord deze mail.</p>
            @endif
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} KiteSurfSchool Windkracht-12. Alle rechten voorbehouden.</p>
            <p>Locatie: Zandvoort, Scheveningen, IJmuiden en meer.</p>
        </div>
    </div>
</body>
</html>

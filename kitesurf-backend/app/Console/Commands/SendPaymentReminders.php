<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Mail\PaymentReminderMail;
use Illuminate\Support\Facades\Mail;

class SendPaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:remind';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Stuur een herinneringsmail voor openstaande betalingen (reserveringen na 7 dagen nog niet betaald)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Zoek alle reserveringen die 7 dagen of ouder zijn en nog steeds "voorlopig" zijn (nog niet betaald)
        $reservations = Reservation::with('customer')
            ->where('status', 'voorlopig')
            ->where('created_at', '<=', now()->subDays(7))
            // Je zou hier een veld 'reminder_sent' kunnen toevoegen om dubbele mails te voorkomen, 
            // maar in dit simpele voorbeeld sturen we voor nu gewoon een mail.
            ->get();

        $count = 0;
        foreach ($reservations as $reservation) {
            try {
                Mail::to($reservation->customer->email)->send(new PaymentReminderMail($reservation));
                $this->info('Herinnering gestuurd naar: ' . $reservation->customer->email);
                $count++;
                sleep(1); // Mailtrap limiet voorkomen
            } catch (\Exception $e) {
                $this->error('Fout bij sturen herinnering naar ' . $reservation->customer->email . ': ' . $e->getMessage());
            }
        }

        $this->info("Klaar! $count herinneringen verzonden.");
    }
}

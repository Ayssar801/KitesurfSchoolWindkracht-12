<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationFinalizedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public $recipientType; // 'customer' of 'instructor'

    /**
     * Create a new message instance.
     */
    public function __construct(Reservation $reservation, string $recipientType = 'customer')
    {
        $this->reservation = $reservation;
        $this->recipientType = $recipientType;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->recipientType === 'instructor'
            ? 'Nieuwe lesreservering toegewezen! - Windkracht-12'
            : 'Bevestiging: Kitesurflessen gaan door! - Windkracht-12';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.finalized',
            with: [
                'recipientType' => $this->recipientType,
            ]
        );
    }
}

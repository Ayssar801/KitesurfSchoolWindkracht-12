<?php

namespace App\Mail;

use App\Models\ReservationLesson;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LessonCancellationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $lesson;
    public $reason;
    public $cancelledBy;
    public $recipientType;

    /**
     * Create a new message instance.
     */
    public function __construct(ReservationLesson $lesson, string $reason, string $cancelledBy, string $recipientType = 'customer')
    {
        $this->lesson = $lesson;
        $this->reason = $reason;
        $this->cancelledBy = $cancelledBy;
        $this->recipientType = $recipientType;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Annulering Lesdatum - KiteSurfSchool Windkracht-12',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.cancellation',
            with: [
                'recipientType' => $this->recipientType,
            ]
        );
    }
}

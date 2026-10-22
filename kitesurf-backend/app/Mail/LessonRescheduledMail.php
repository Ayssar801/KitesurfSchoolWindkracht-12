<?php

namespace App\Mail;

use App\Models\ReservationLesson;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LessonRescheduledMail extends Mailable
{
    use Queueable, SerializesModels;

    public $lesson;
    public $oldDate;
    public $recipientType;

    /**
     * Create a new message instance.
     */
    public function __construct(ReservationLesson $lesson, string $oldDate, string $recipientType = 'customer')
    {
        $this->lesson = $lesson;
        $this->oldDate = $oldDate;
        $this->recipientType = $recipientType;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bevestiging: Nieuwe Lesdatum - KiteSurfSchool Windkracht-12',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.rescheduled',
        );
    }
}

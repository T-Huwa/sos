<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class DonationReceipt extends Mailable
{
    public $donation, $pdfData, $fileName;

    public function __construct($donation, $pdfData, $fileName)
    {
        $this->donation = $donation;
        $this->pdfData = $pdfData;
        $this->fileName = $fileName;
    }

    public function build()
    {
        return $this->subject('Thank You for Your Donation')
            ->view('emails.receipt')
            ->attachData($this->pdfData, $this->fileName, [
                'mime' => 'application/pdf',
            ]);
    }
}

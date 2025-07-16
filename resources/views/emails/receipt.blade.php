<p>Dear {{ $donation->user->name ?? $donation->guest_name }},</p>
<p>Thank you for your generous donation of MWK {{ number_format($donation->amount, 2) }}.</p>
<p>Attached is your donation receipt.</p>
<p>We appreciate your support!</p>

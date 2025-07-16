<h1>Donation Receipt</h1>
<p><strong>Donor:</strong> {{ $donation->user->name ?? $donation->guest_name }}</p>
<p><strong>Email:</strong> {{ $donation->user->email ?? $donation->guest_email }}</p>
<p><strong>Amount:</strong> MWK {{ number_format($donation->amount, 2) }}</p>
<p><strong>Status:</strong> {{ ucfirst($donation->status) }}</p>
<p><strong>Date:</strong> {{ $donation->created_at->format('F j, Y') }}</p>

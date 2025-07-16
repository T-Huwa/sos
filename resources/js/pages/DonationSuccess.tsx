import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';

export default function DonationSuccess() {
    const { donation } = usePage().props as any;
    const donor = donation.user?.name || donation.guest_name;

    return (
        <AppLayout>
            <div className="mx-auto max-w-xl space-y-4 p-6 text-center">
                <h1 className="text-2xl font-bold text-green-600">Thank You for Your Donation!</h1>

                <p className="text-lg">
                    Dear <strong>{donor}</strong>,
                </p>
                <p>
                    We have received your donation of <strong>MWK {Number(donation.amount).toLocaleString()}</strong>.
                </p>

                <p>
                    A receipt has been sent to <strong>{donation.user?.email || donation.guest_email}</strong>.
                </p>

                <p>Your support helps us continue our mission. We are grateful for your generosity.</p>

                <Button onClick={() => (window.location.href = '/')}>Return Home</Button>
            </div>
        </AppLayout>
    );
}

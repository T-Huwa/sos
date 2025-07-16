import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import PayChangu from 'paychangu-js';
import { useEffect, useState } from 'react';

export default function DonatePage() {
    const { auth } = usePage().props as any;
    const [amount, setAmount] = useState('');
    const [donationType, setDonationType] = useState('money');
    const [isAnonymous, setIsAnonymous] = useState(!auth?.user);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [donatingToChild, setDonatingToChild] = useState(false);
    const [childId, setChildId] = useState('');
    const [children, setChildren] = useState([]);

    useEffect(() => {
        PayChangu.init({
            publicKey: process.env.NEXT_PUBLIC_PAYCHANGU_KEY || '',
        });
    }, []);

    useEffect(() => {
        if (donatingToChild) {
            axios.get('/api/children').then((res) => setChildren(res.data));
        }
    }, [donatingToChild]);

    const handleSubmit = async () => {
        if (!amount || (isAnonymous && (!guestName || !guestEmail))) {
            alert('Please fill all required fields.');
            return;
        }

        const response = await axios.post('/donations', {
            amount,
            donation_type: donationType,
            child_id: donatingToChild ? childId : null,
            guest_name: isAnonymous ? guestName : null,
            guest_email: isAnonymous ? guestEmail : null,
        });

        const { checkout_ref } = response.data;

        PayChangu.checkout({
            reference: checkout_ref,
            amount: parseFloat(amount),
            metadata: { child_id: childId },
            onSuccess: () => {
                window.location.href = `/donations/${checkout_ref}/success`;
            },
            onFailure: (err) => {
                console.error(err);
                alert('Payment failed or cancelled');
            },
        });
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <h1 className="text-2xl font-bold">Make a Donation</h1>

                <label className="block">
                    <span>Donate Anonymously?</span>
                    <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                </label>

                {isAnonymous && (
                    <div className="space-y-2">
                        <Input placeholder="Your Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                        <Input placeholder="Your Email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                    </div>
                )}

                <label className="block">
                    <span>Donation Type</span>
                    <select className="w-full rounded border p-2" value={donationType} onChange={(e) => setDonationType(e.target.value)}>
                        <option value="money">Money</option>
                        <option value="goods">Goods</option>
                    </select>
                </label>

                <Input placeholder="Amount (MWK)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

                <label className="block">
                    <span>Donate to a Child?</span>
                    <input type="checkbox" checked={donatingToChild} onChange={(e) => setDonatingToChild(e.target.checked)} />
                </label>

                {donatingToChild && (
                    <select className="w-full rounded border p-2" value={childId} onChange={(e) => setChildId(e.target.value)}>
                        <option value="">Select Child</option>
                        {children.map((child: any) => (
                            <option key={child.id} value={child.id}>
                                {child.first_name} {child.last_name}
                            </option>
                        ))}
                    </select>
                )}

                <Button onClick={handleSubmit}>Donate Now</Button>
            </div>
        </AppLayout>
    );
}

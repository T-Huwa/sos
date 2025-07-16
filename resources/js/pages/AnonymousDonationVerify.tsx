import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AnonymousDonationVerify() {
    const [txRef, setTxRef] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!txRef.trim()) {
            toast.error('Please enter a transaction reference');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/anonymous-donation/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ tx_ref: txRef }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                if (data.redirect_url) {
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 1500);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <Card className="mx-auto max-w-md rounded-2xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Verify Anonymous Donation</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        If your payment was successful but you didn't receive a confirmation, 
                        enter your transaction reference below to verify your donation.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="txRef">Transaction Reference</Label>
                        <Input
                            id="txRef"
                            placeholder="Enter your transaction reference (tx_ref)"
                            value={txRef}
                            onChange={(e) => setTxRef(e.target.value)}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                            This is usually provided by PayChangu after payment completion
                        </p>
                    </div>

                    <Button 
                        className="w-full" 
                        onClick={handleVerify} 
                        disabled={loading || !txRef.trim()}
                    >
                        {loading ? 'Verifying...' : 'Verify Transaction'}
                    </Button>

                    <div className="text-center">
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = '/anonymous-donation'}
                        >
                            Back to Donation Form
                        </Button>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                        <h3 className="mb-2 font-semibold text-blue-800">Need Help?</h3>
                        <p className="text-sm text-blue-700">
                            If you're having trouble verifying your donation, please contact our support team at{' '}
                            <a href="mailto:support@sos.org" className="underline">
                                support@sos.org
                            </a>{' '}
                            with your transaction reference.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

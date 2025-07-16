import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface Donation {
    id: number;
    anonymous_name: string;
    anonymous_email: string;
    amount: number;
    donation_type: string;
    status: string;
    created_at: string;
}

interface Props {
    donation?: Donation;
}

export default function AnonymousDonationFailed() {
    const { donation } = usePage().props as Props;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <Card className="mx-auto max-w-2xl rounded-2xl shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600">
                        Donation Failed
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="text-center">
                        <p className="text-lg">
                            {donation ? `Dear ${donation.anonymous_name},` : 'Dear Donor,'}
                        </p>
                        <p className="mt-2 text-gray-600">
                            Unfortunately, your donation could not be processed at this time.
                        </p>
                    </div>

                    {donation && (
                        <div className="rounded-lg bg-gray-50 p-4">
                            <h3 className="mb-3 font-semibold">Donation Details:</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Donation Type:</span>
                                    <span className="font-medium">
                                        {donation.donation_type === 'money' ? 'Cash Donation' : 'Item Donation'}
                                    </span>
                                </div>
                                {donation.donation_type === 'money' && (
                                    <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className="font-medium">
                                            MWK {Number(donation.amount).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="font-medium capitalize text-red-600">
                                        {donation.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span className="font-medium">
                                        {new Date(donation.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-yellow-50 p-4">
                        <h3 className="mb-2 font-semibold text-yellow-800">Common reasons for payment failure:</h3>
                        <ul className="space-y-1 text-sm text-yellow-700">
                            <li>• Insufficient funds in your account</li>
                            <li>• Network connectivity issues</li>
                            <li>• Payment was cancelled by user</li>
                            <li>• Bank or payment provider declined the transaction</li>
                            <li>• Incorrect payment details</li>
                        </ul>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                        <h3 className="mb-2 font-semibold text-blue-800">What you can do:</h3>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Check your account balance and try again</li>
                            <li>• Ensure you have a stable internet connection</li>
                            <li>• Contact your bank if the issue persists</li>
                            <li>• Try using a different payment method</li>
                            <li>• Contact our support team if you need assistance</li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <p className="mb-4 text-gray-600">
                            We appreciate your intention to donate and support our cause. 
                            Please don't hesitate to try again or contact us if you need help.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button 
                                onClick={() => (window.location.href = '/anonymous-donation')} 
                                variant="default"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Button onClick={() => (window.location.href = '/')} variant="outline">
                                Return Home
                            </Button>
                        </div>
                    </div>

                    <div className="border-t pt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Need help? Contact us at{' '}
                            <a href="mailto:support@sos.org" className="text-blue-600 hover:underline">
                                support@sos.org
                            </a>{' '}
                            or call us at{' '}
                            <a href="tel:+265123456789" className="text-blue-600 hover:underline">
                                +265 123 456 789
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

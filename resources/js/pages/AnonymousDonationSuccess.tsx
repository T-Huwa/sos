import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface Donation {
    id: number;
    anonymous_name: string;
    anonymous_email: string;
    amount: number;
    donation_type: string;
    status: string;
    created_at: string;
    items?: Array<{
        item_name: string;
        quantity: number;
        description?: string;
    }>;
}

interface Props {
    donation: Donation;
}

export default function AnonymousDonationSuccess() {
    const { donation } = usePage().props as Props;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <Card className="mx-auto max-w-2xl rounded-2xl shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">
                        Thank You for Your Donation!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="text-center">
                        <p className="text-lg">
                            Dear <strong>{donation.anonymous_name}</strong>,
                        </p>
                        <p className="mt-2 text-gray-600">
                            We have successfully received your generous donation.
                        </p>
                    </div>

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
                                <span className="font-medium capitalize text-green-600">
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

                    {donation.items && donation.items.length > 0 && (
                        <div className="rounded-lg bg-gray-50 p-4">
                            <h3 className="mb-3 font-semibold">Donated Items:</h3>
                            <div className="space-y-2">
                                {donation.items.map((item, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{item.item_name}</span>
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-blue-50 p-4">
                        <h3 className="mb-2 font-semibold text-blue-800">What happens next?</h3>
                        <ul className="space-y-1 text-sm text-blue-700">
                            {donation.donation_type === 'money' ? (
                                <>
                                    <li>• A receipt has been sent to {donation.anonymous_email}</li>
                                    <li>• Your donation will be used to support children in need</li>
                                    <li>• You may receive updates on how your donation is making a difference</li>
                                </>
                            ) : (
                                <>
                                    <li>• We will contact you at {donation.anonymous_email} to arrange pickup</li>
                                    <li>• Our team will coordinate a convenient time for collection</li>
                                    <li>• Your items will be distributed to children who need them most</li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="text-center">
                        <p className="mb-4 text-gray-600">
                            Your generosity helps us continue our mission to support children in need.
                            We are deeply grateful for your contribution.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button onClick={() => (window.location.href = '/')} variant="default">
                                Return Home
                            </Button>
                            <Button 
                                onClick={() => (window.location.href = '/anonymous-donation')} 
                                variant="outline"
                            >
                                Make Another Donation
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { XCircle, RefreshCw, Gift, Package, User } from 'lucide-react';

interface DonatedItem {
    id: number;
    item_name: string;
    quantity: number;
    estimated_value?: number;
}

interface Child {
    id: number;
    name: string;
    age: number;
}

interface Donation {
    id: number;
    amount?: number;
    donation_type: 'money' | 'goods';
    status: string;
    description?: string;
    created_at: string;
    child?: Child;
    donated_items?: DonatedItem[];
}

interface Props {
    donation?: Donation;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/donor/dashboard',
    },
    {
        title: 'Donations',
        href: '/donor/donations',
    },
    {
        title: 'Failed',
        href: '#',
    },
];

export default function DonorDonationFailed() {
    const { donation } = usePage().props as Props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Donation Failed" />
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
                                Unfortunately, your donation could not be processed at this time.
                            </p>
                            <p className="mt-2 text-gray-600">
                                We apologize for the inconvenience. Please try again or contact our support team.
                            </p>
                        </div>

                        {donation && (
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-3 font-semibold">Donation Details:</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Donation Type:</span>
                                        <span className="font-medium flex items-center gap-1">
                                            {donation.donation_type === 'money' ? (
                                                <>
                                                    <Gift className="h-4 w-4" />
                                                    Cash Donation
                                                </>
                                            ) : (
                                                <>
                                                    <Package className="h-4 w-4" />
                                                    Item Donation
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    {donation.donation_type === 'money' && donation.amount && (
                                        <div className="flex justify-between">
                                            <span>Amount:</span>
                                            <span className="font-medium">
                                                MWK {Number(donation.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {donation.child && (
                                        <div className="flex justify-between">
                                            <span>Beneficiary:</span>
                                            <span className="font-medium flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {donation.child.name} (Age {donation.child.age})
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
                                <Button asChild className="flex items-center gap-2">
                                    <Link href="/donor/donate">
                                        <RefreshCw className="h-4 w-4" />
                                        Try Again
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/donor/donations">View All Donations</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/donor/dashboard">Return to Dashboard</Link>
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
        </AppLayout>
    );
}

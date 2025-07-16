import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle, Gift, Package, User } from 'lucide-react';

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
    donation: Donation;
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
        title: 'Success',
        href: '#',
    },
];

export default function DonorDonationSuccess() {
    const { donation } = usePage().props as Props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Donation Successful" />
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
                                Your generous contribution has been successfully processed.
                            </p>
                            <p className="mt-2 text-gray-600">
                                We are deeply grateful for your support in helping children in need.
                            </p>
                        </div>

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

                        {donation.donated_items && donation.donated_items.length > 0 && (
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-3 font-semibold">Donated Items:</h3>
                                <div className="space-y-2">
                                    {donation.donated_items.map((item, index) => (
                                        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{item.item_name}</span>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {donation.description && (
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-2 font-semibold">Your Message:</h3>
                                <p className="text-gray-700">{donation.description}</p>
                            </div>
                        )}

                        <div className="rounded-lg bg-blue-50 p-4">
                            <h3 className="mb-2 font-semibold text-blue-800">What happens next?</h3>
                            <ul className="space-y-1 text-sm text-blue-700">
                                {donation.donation_type === 'money' ? (
                                    <>
                                        <li>• A receipt has been sent to your email</li>
                                        <li>• Your donation will be used to support children in need</li>
                                        <li>• You can track the impact in your donor dashboard</li>
                                        {donation.child && (
                                            <li>• You may receive updates on {donation.child.name}'s progress</li>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <li>• We will contact you to arrange pickup of the donated items</li>
                                        <li>• Our team will coordinate a convenient time for collection</li>
                                        <li>• Your items will be distributed to children who need them most</li>
                                        {donation.child && (
                                            <li>• The items will be given to {donation.child.name}</li>
                                        )}
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="text-center">
                            <p className="mb-4 text-gray-600">
                                Your generosity helps us continue our mission to support children in need.
                                Thank you for making a difference!
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button asChild>
                                    <Link href="/donor/donations">View All Donations</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/donor/donate">Make Another Donation</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/donor/dashboard">Return to Dashboard</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

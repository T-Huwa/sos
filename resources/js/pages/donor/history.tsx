import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Gift } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const recentDonations = [
        { id: 1, child: 'Chisomo Phiri', amount: 'MWK 15,000', date: '2024-01-15', type: 'Money', status: 'Delivered' },
        {
            id: 2,
            child: 'Mphatso Banda',
            amount: 'School Supplies',
            date: '2024-01-10',
            type: 'Items',
            status: 'In Transit',
        },
        { id: 3, child: 'Thandiwe Mwale', amount: 'MWK 8,000', date: '2024-01-05', type: 'Money', status: 'Delivered' },
    ];

    const sponsoredChildren = [
        { id: 1, name: 'Chisomo Phiri', age: 12, school: 'Lilongwe Primary', progress: 85 },
        { id: 2, name: 'Mphatso Banda', age: 10, school: 'Blantyre Community School', progress: 92 },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Donation History</CardTitle>
                        <CardDescription>Complete record of your contributions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDonations.map((donation) => (
                                <div key={donation.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                            <Gift className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{donation.child}</p>
                                            <p className="text-sm text-gray-600">
                                                {donation.type} • {donation.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{donation.amount}</p>
                                        <Badge variant={donation.status === 'Delivered' ? 'default' : 'secondary'}>{donation.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

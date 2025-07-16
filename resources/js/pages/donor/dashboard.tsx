import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Gift, Heart, TrendingUp, Users } from 'lucide-react';

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
            <Head title="Dashboard" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Donor Dashboard</h1>
                    <p className="text-gray-600">Track your donations and see the impact you're making</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Donated</p>
                                    <p className="text-2xl font-bold text-green-600">MWK 45,000</p>
                                </div>
                                <Gift className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Children Helped</p>
                                    <p className="text-2xl font-bold text-blue-600">8</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-purple-600">MWK 12,000</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thank You Letters</p>
                                    <p className="text-2xl font-bold text-orange-600">5</p>
                                </div>
                                <Heart className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Donations</CardTitle>
                            <CardDescription>Your latest contributions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentDonations.map((donation) => (
                                    <div key={donation.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                        <div>
                                            <p className="font-medium">{donation.child}</p>
                                            <p className="text-sm text-gray-600">
                                                {donation.amount} • {donation.date}
                                            </p>
                                        </div>
                                        <Badge variant={donation.status === 'Delivered' ? 'default' : 'secondary'}>{donation.status}</Badge>
                                    </div>
                                ))}
                            </div>
                            <Button className="mt-4 w-full" asChild>
                                <Link href="/children">Donate to More Children</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Children You're Supporting</CardTitle>
                            <CardDescription>Track their progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sponsoredChildren.map((child) => (
                                    <div key={child.id} className="rounded-lg bg-gray-50 p-3">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="font-medium">{child.name}</p>
                                            <Badge>{child.progress}% Progress</Badge>
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600">
                                            Age {child.age} • {child.school}
                                        </p>
                                        <Progress value={child.progress} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

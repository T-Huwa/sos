import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {sponsoredChildren.map((child) => (
                    <Card key={child.id}>
                        <CardHeader>
                            <CardTitle>{child.name}</CardTitle>
                            <CardDescription>
                                Age {child.age} • {child.school}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-sm font-medium">Academic Progress</span>
                                        <span className="text-sm text-gray-600">{child.progress}%</span>
                                    </div>
                                    <Progress value={child.progress} className="h-2" />
                                </div>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/children/${child.id}`}>View Full Profile</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}

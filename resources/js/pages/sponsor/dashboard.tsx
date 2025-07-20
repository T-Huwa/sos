'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Heart, Mail, Star, TrendingUp } from 'lucide-react';

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
    first_image?: string;
    images_count: number;
}

interface Props {
    campaigns: Campaign[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ campaigns = [] }: Props) {
    const getUpdateTypeColor = (type: string) => {
        switch (type) {
            case 'Academic':
                return 'bg-blue-100 text-blue-800';
            case 'Health':
                return 'bg-green-100 text-green-800';
            case 'Personal':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const sponsoredChildren = [
        {
            id: 1,
            name: 'Chisomo Phiri',
            age: 12,
            school: 'Lilongwe Primary School',
            grade: 'Standard 6',
            location: 'Lilongwe',
            sponsorshipStart: '2023-06-15',
            totalContributed: 45000,
            academicProgress: 85,
            healthStatus: 'Good',
            lastUpdate: '2024-01-15',
        },
        {
            id: 2,
            name: 'Thandiwe Mwale',
            age: 14,
            school: 'Mzuzu Secondary School',
            grade: 'Form 2',
            location: 'Mzuzu',
            sponsorshipStart: '2023-09-01',
            totalContributed: 32000,
            academicProgress: 92,
            healthStatus: 'Excellent',
            lastUpdate: '2024-01-12',
        },
    ];

    const recentUpdates = [
        {
            id: 1,
            child: 'Chisomo Phiri',
            type: 'Academic',
            message: 'Chisomo scored 85% in her mathematics exam and is now in the top 5 of her class!',
            date: '2024-01-15',
        },
        {
            id: 2,
            child: 'Thandiwe Mwale',
            type: 'Health',
            message: 'Thandiwe had her regular health checkup. All results are excellent!',
            date: '2024-01-12',
        },
        {
            id: 3,
            child: 'Chisomo Phiri',
            type: 'Personal',
            message: 'Chisomo wrote a thank you letter expressing gratitude for the new school supplies.',
            date: '2024-01-10',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Sponsor Dashboard</h1>
                    <p className="text-gray-600">Track your donations and see the impact you're making</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Children Sponsored</p>
                                    <p className="text-2xl font-bold text-purple-600">{sponsoredChildren.length}</p>
                                </div>
                                <Star className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Contributed</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        MWK {sponsoredChildren.reduce((sum, child) => sum + child.totalContributed, 0).toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Progress</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {Math.round(
                                            sponsoredChildren.reduce((sum, child) => sum + child.academicProgress, 0) / sponsoredChildren.length,
                                        )}
                                        %
                                    </p>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Recent Updates</p>
                                    <p className="text-2xl font-bold text-orange-600">{recentUpdates.length}</p>
                                </div>
                                <Mail className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Campaigns Section */}
                {campaigns.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>Support ongoing campaigns and make a direct impact</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {campaigns.map((campaign) => (
                                    <div key={campaign.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                                        {campaign.first_image && (
                                            <div className="mb-3 h-32 overflow-hidden rounded">
                                                <img src={campaign.first_image} alt="Campaign" className="h-full w-full object-cover" />
                                            </div>
                                        )}
                                        <div className="mb-2 flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                {campaign.images_count} image{campaign.images_count !== 1 ? 's' : ''}
                                            </Badge>
                                            <span className="text-xs text-gray-500">{campaign.created_at}</span>
                                        </div>
                                        <h4 className="mb-2 font-medium text-gray-900">{campaign.created_by}'s Campaign</h4>
                                        <p className="mb-3 text-sm leading-relaxed text-gray-600">
                                            {campaign.message.length > 80 ? campaign.message.substring(0, 80) + '...' : campaign.message}
                                        </p>
                                        <Link href={`/campaigns/${campaign.id}/donate-authenticated`}>
                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                                <Heart className="mr-2 h-4 w-4" />
                                                Donate Now
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

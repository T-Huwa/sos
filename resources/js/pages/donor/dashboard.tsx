import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Gift, Heart, Loader2, Package, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DonatedItem {
    id: number;
    item_name: string;
    quantity: number;
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
    status: 'pending' | 'received' | 'failed';
    description?: string;
    created_at: string;
    child?: Child;
    donated_items?: DonatedItem[];
}

interface Stats {
    total_donated: number;
    total_donations: number;
    children_helped: number;
    this_month: number;
}

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
    first_image?: string;
    images_count: number;
}

interface DashboardData {
    stats: Stats;
    recent_donations: Donation[];
    campaigns: Campaign[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/donor/dashboard',
    },
];

export default function DonorDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/donor/donations/api?limit=5', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDashboardData({
                    stats: data.stats,
                    recent_donations: data.donations.data.slice(0, 5), // Get first 5 for recent donations
                    campaigns: data.campaigns || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number | undefined, type: string) => {
        if (type === 'goods') return 'Items';
        return amount ? `MWK ${amount.toLocaleString()}` : 'N/A';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'received':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Donor Dashboard</h1>
                    <p className="text-gray-600">Track your donations and see the impact you're making</p>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        {[...Array(4)].map((_, index) => (
                            <Card key={index}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : dashboardData ? (
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Donated</p>
                                        <p className="text-2xl font-bold text-green-600">MWK {dashboardData.stats.total_donated.toLocaleString()}</p>
                                    </div>
                                    <Gift className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Donations</p>
                                        <p className="text-2xl font-bold text-blue-600">{dashboardData.stats.total_donations}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Children Helped</p>
                                        <p className="text-2xl font-bold text-purple-600">{dashboardData.stats.children_helped}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">This Month</p>
                                        <p className="text-2xl font-bold text-orange-600">MWK {dashboardData.stats.this_month.toLocaleString()}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="mb-8 text-center">
                        <p className="text-gray-500">Failed to load dashboard data</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Donations</CardTitle>
                            <CardDescription>Your latest contributions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="ml-2">Loading donations...</span>
                                </div>
                            ) : dashboardData && dashboardData.recent_donations.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.recent_donations.map((donation) => (
                                        <div key={donation.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    {donation.donation_type === 'money' ? (
                                                        <Gift className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <Package className="h-4 w-4 text-blue-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{donation.child ? donation.child.name : 'General Donation'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatAmount(donation.amount, donation.donation_type)} • {formatDate(donation.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(donation.status)}>
                                                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Gift className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">Start making a difference by donating to children in need.</p>
                                </div>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Button className="flex-1" asChild>
                                    <Link href="/donor/donate">Make Donation</Link>
                                </Button>
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link href="/donor/donations">View All</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Children You've Helped</CardTitle>
                            <CardDescription>Children who have received your donations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="ml-2">Loading children...</span>
                                </div>
                            ) : dashboardData && dashboardData.recent_donations.some((d) => d.child) ? (
                                <div className="space-y-4">
                                    {dashboardData.recent_donations
                                        .filter((d) => d.child)
                                        .reduce((unique: Donation[], donation) => {
                                            if (!unique.find((d) => d.child?.id === donation.child?.id)) {
                                                unique.push(donation);
                                            }
                                            return unique;
                                        }, [])
                                        .slice(0, 3)
                                        .map((donation) => (
                                            <div key={donation.child!.id} className="rounded-lg bg-gray-50 p-3">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="font-medium">{donation.child!.name}</p>
                                                    <Badge variant="outline">Age {donation.child!.age}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">Last donation: {formatDate(donation.created_at)}</p>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No specific children yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">Donate to specific children to see them here.</p>
                                </div>
                            )}
                            <Button className="mt-4 w-full" variant="outline" asChild>
                                <Link href="/donor/children">Browse Children</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Campaigns Section */}
                {dashboardData && dashboardData.campaigns.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>Support ongoing campaigns and make a direct impact</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {dashboardData.campaigns.map((campaign) => (
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

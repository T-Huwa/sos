import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Image, MessageSquare, Plus, Search, User } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
    images_count: number;
    first_image?: string;
    target_amount?: number;
    total_raised: number;
    progress_percentage: number;
    remaining_amount: number;
    is_goal_reached: boolean;
    is_completed: boolean;
}

interface Props {
    campaigns: Campaign[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/inventory/dashboard',
    },
    {
        title: 'Campaigns',
        href: '/inventory/campaigns',
    },
];

export default function CampaignsIndexPage({ campaigns }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((campaign) => {
            const matchesSearch =
                campaign.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.created_by.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [campaigns, searchTerm]);

    const truncateMessage = (message: string, maxLength: number = 150) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Donation Campaigns" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Donation Campaigns</h1>
                        <p className="text-gray-600">Create and manage donation campaigns to engage supporters</p>
                    </div>
                    <Link href="/inventory/campaigns/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Campaign
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                                    <p className="text-2xl font-bold text-blue-600">{campaigns.length}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Images</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {campaigns.reduce((sum, campaign) => sum + campaign.images_count, 0)}
                                    </p>
                                </div>
                                <Image className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {
                                            campaigns.filter((campaign) => {
                                                const campaignDate = new Date(campaign.created_at);
                                                const now = new Date();
                                                return campaignDate.getMonth() === now.getMonth() && campaignDate.getFullYear() === now.getFullYear();
                                            }).length
                                        }
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Search Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by message or creator..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                            {campaign.first_image && (
                                <div className="h-48 overflow-hidden">
                                    <img src={campaign.first_image} alt="Campaign" className="h-full w-full object-cover" />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-xs">
                                        {campaign.images_count} image{campaign.images_count !== 1 ? 's' : ''}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{campaign.created_at}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm leading-relaxed text-gray-700">{truncateMessage(campaign.message)}</p>

                                {/* Progress Information */}
                                {campaign.target_amount && (
                                    <div className="mb-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Goal Progress</span>
                                            <span className={`font-medium ${campaign.is_completed ? 'text-green-600' : 'text-blue-600'}`}>
                                                {campaign.progress_percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    campaign.is_completed ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>MWK {campaign.total_raised.toLocaleString()} raised</span>
                                            <span>MWK {campaign.target_amount.toLocaleString()} goal</span>
                                        </div>
                                        {campaign.is_completed && (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                Goal Reached!
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User className="h-3 w-3" />
                                        {campaign.created_by}
                                    </div>
                                    <Link href={`/inventory/campaigns/${campaign.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCampaigns.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No campaigns found</h3>
                            <p className="mb-4 text-gray-600">
                                {searchTerm ? 'No campaigns match your search criteria.' : 'Get started by creating your first donation campaign.'}
                            </p>
                            {!searchTerm && (
                                <Link href="/inventory/campaigns/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Campaign
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, Gift, Image as ImageIcon, Package, Share2, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';

interface CampaignImage {
    id: number;
    url: string;
    original_name: string;
}

interface DonationItem {
    id: number;
    item_name: string;
    quantity: number;
    estimated_value?: number;
}

interface CampaignDonation {
    id: number;
    donation_type: 'money' | 'goods';
    amount?: number;
    description?: string;
    status: string;
    is_anonymous: boolean;
    donor_name?: string;
    donor_email?: string;
    created_at: string;
    items: DonationItem[];
}

interface CampaignStatistics {
    total_donations: number;
    total_cash_amount: number;
    total_item_donations: number;
    total_items: number;
}

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
    images: CampaignImage[];
    donations: CampaignDonation[];
    statistics: CampaignStatistics;
}

interface Props {
    campaign: Campaign;
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
    {
        title: 'Campaign Details',
        href: '#',
    },
];

export default function ShowCampaignPage({ campaign }: Props) {
    const page = usePage();
    const userRole = (page.props as any).auth?.user?.role;
    const isInventoryManager = userRole === 'inventory_manager';

    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const openImageModal = (index: number) => {
        setSelectedImageIndex(index);
    };

    const closeImageModal = () => {
        setSelectedImageIndex(null);
    };

    const nextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < campaign.images.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedImageIndex !== null) {
            if (e.key === 'Escape') closeImageModal();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    };

    // Add keyboard event listener
    useState(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Campaign - ${campaign.created_at}`} />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/inventory/campaigns">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Campaigns
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Campaign Details</h1>
                            <p className="text-gray-600">View campaign message and images</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Campaign Info */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">{campaign.created_at}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Created by:</span>
                                    <span className="font-medium">{campaign.created_by}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ImageIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Images:</span>
                                    <Badge variant="secondary">
                                        {campaign.images.length} image{campaign.images.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Campaign Message */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Message</CardTitle>
                                <CardDescription>The story and call to action for this donation campaign</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{campaign.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Campaign Images */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Campaign Images</CardTitle>
                        <CardDescription>Visual content for this donation campaign</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {campaign.images.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {campaign.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className="group relative cursor-pointer overflow-hidden rounded-lg"
                                        onClick={() => openImageModal(index)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.original_name}
                                            className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                        <div className="absolute right-2 bottom-2 left-2">
                                            <p className="truncate rounded bg-black/50 px-2 py-1 text-xs text-white">{image.original_name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-gray-600">No images available for this campaign</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Campaign Donations Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Campaign Donations</CardTitle>
                        <CardDescription>Track donations received for this campaign</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Statistics Cards */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Donations</p>
                                            <p className="text-2xl font-bold text-blue-600">{campaign.statistics.total_donations}</p>
                                        </div>
                                        <Gift className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            {!isInventoryManager && (
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Cash Received</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    MWK {campaign.statistics.total_cash_amount.toLocaleString()}
                                                </p>
                                            </div>
                                            {/* <DollarSign className="h-8 w-8 text-green-600" /> */}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Item Donations</p>
                                            <p className="text-2xl font-bold text-purple-600">{campaign.statistics.total_item_donations}</p>
                                        </div>
                                        <Package className="h-8 w-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Items</p>
                                            <p className="text-2xl font-bold text-orange-600">{campaign.statistics.total_items}</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-orange-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Donations Table */}
                        {campaign.donations.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Donor</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Message</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaign.donations.map((donation) => (
                                            <TableRow key={donation.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{donation.is_anonymous ? 'Anonymous' : donation.donor_name}</p>
                                                        {donation.donor_name && donation.is_anonymous && (
                                                            <p className="text-sm text-gray-500">{donation.donor_name}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{donation.items.length} item(s)</p>
                                                        <p className="text-sm text-gray-500">
                                                            {donation.items.reduce((sum, item) => sum + item.quantity, 0)} total qty
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={donation.status === 'received' ? 'default' : 'secondary'}>
                                                        {donation.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{donation.created_at}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {donation.description
                                                            ? donation.description.length > 50
                                                                ? donation.description.substring(0, 50) + '...'
                                                                : donation.description
                                                            : '-'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Gift className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-gray-600">No donations received yet for this campaign</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Image Modal */}
                {selectedImageIndex !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeImageModal}>
                        <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={campaign.images[selectedImageIndex].url}
                                alt={campaign.images[selectedImageIndex].original_name}
                                className="max-h-full max-w-full object-contain"
                            />
                            <button
                                onClick={closeImageModal}
                                className="absolute -top-4 -right-4 rounded-full bg-white p-2 text-gray-600 hover:text-gray-900"
                            >
                                ✕
                            </button>
                            {campaign.images.length > 1 && (
                                <>
                                    {selectedImageIndex > 0 && (
                                        <button
                                            onClick={prevImage}
                                            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900"
                                        >
                                            ←
                                        </button>
                                    )}
                                    {selectedImageIndex < campaign.images.length - 1 && (
                                        <button
                                            onClick={nextImage}
                                            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900"
                                        >
                                            →
                                        </button>
                                    )}
                                </>
                            )}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white">
                                {selectedImageIndex + 1} of {campaign.images.length}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

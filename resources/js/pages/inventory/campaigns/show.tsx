import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Image as ImageIcon, Download, Share2 } from 'lucide-react';
import { useState } from 'react';

interface CampaignImage {
    id: number;
    url: string;
    original_name: string;
}

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
    images: CampaignImage[];
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
                                <CardDescription>
                                    The story and call to action for this donation campaign
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {campaign.message}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Campaign Images */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Campaign Images</CardTitle>
                        <CardDescription>
                            Visual content for this donation campaign
                        </CardDescription>
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
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <p className="truncate rounded bg-black/50 px-2 py-1 text-xs text-white">
                                                {image.original_name}
                                            </p>
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

                {/* Image Modal */}
                {selectedImageIndex !== null && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                        onClick={closeImageModal}
                    >
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
                                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900"
                                        >
                                            ←
                                        </button>
                                    )}
                                    {selectedImageIndex < campaign.images.length - 1 && (
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900"
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

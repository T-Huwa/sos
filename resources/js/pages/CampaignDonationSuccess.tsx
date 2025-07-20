import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Heart, Home, Share2 } from 'lucide-react';

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
}

interface Donation {
    id: number;
    amount?: number;
    donation_type: 'money' | 'goods';
    description?: string;
    status: string;
    is_anonymous: boolean;
    anonymous_name?: string;
    created_at: string;
    campaign: Campaign;
}

interface Props {
    donation: Donation;
}

export default function CampaignDonationSuccessPage({ donation }: Props) {
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-MW', {
            style: 'currency',
            currency: 'MWK',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const shareMessage = `I just donated to a campaign on SOS! Join me in making a difference. #SOSDonation #MakeADifference`;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'I made a donation!',
                text: shareMessage,
                url: window.location.origin,
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(`${shareMessage} ${window.location.origin}`);
            alert('Share message copied to clipboard!');
        }
    };

    return (
        <AppLayout>
            <Head title="Donation Successful" />
            <div className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-8">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">Thank You!</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Your donation has been successfully processed
                        </p>
                    </div>

                    <Card className="text-left">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                Donation Details
                            </CardTitle>
                            <CardDescription>
                                Here are the details of your generous contribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Donation Type</p>
                                    <p className="text-lg font-semibold capitalize">
                                        {donation.donation_type === 'money' ? 'Cash Donation' : 'Item Donation'}
                                    </p>
                                </div>
                                {donation.amount && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Amount</p>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatAmount(donation.amount)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-600">Campaign</p>
                                <p className="text-gray-900">
                                    {donation.campaign.message.length > 100 
                                        ? donation.campaign.message.substring(0, 100) + '...'
                                        : donation.campaign.message
                                    }
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Created by {donation.campaign.created_by}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-600">Donor</p>
                                <p className="text-gray-900">
                                    {donation.is_anonymous 
                                        ? donation.anonymous_name || 'Anonymous'
                                        : 'Registered User'
                                    }
                                </p>
                            </div>

                            {donation.description && (
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Message</p>
                                    <p className="text-gray-900">{donation.description}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-gray-600">Date & Time</p>
                                <p className="text-gray-900">{formatDate(donation.created_at)}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    {donation.status === 'received' ? 'Completed' : 'Processing'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 space-y-4">
                        <div className="rounded-lg bg-blue-50 p-6">
                            <h3 className="text-lg font-semibold text-blue-900">What happens next?</h3>
                            <div className="mt-3 space-y-2 text-sm text-blue-800">
                                {donation.donation_type === 'money' ? (
                                    <>
                                        <p>• Your payment has been processed securely</p>
                                        <p>• You will receive an email confirmation shortly</p>
                                        <p>• Your donation will be used to support the campaign goals</p>
                                        <p>• You may receive updates on how your donation is making a difference</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• Your item donation has been recorded</p>
                                        <p>• Our team will contact you about item collection/delivery</p>
                                        <p>• Items will be distributed to those in need</p>
                                        <p>• You may receive updates on how your items are helping</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link href="/">
                                <Button size="lg" className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Back to Home
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleShare}
                                className="flex items-center gap-2"
                            >
                                <Share2 className="h-4 w-4" />
                                Share Your Good Deed
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

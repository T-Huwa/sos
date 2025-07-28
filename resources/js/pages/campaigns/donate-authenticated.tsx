import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Gift, Heart, Plus, User, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    target_amount?: number;
    total_raised: number;
    progress_percentage: number;
    remaining_amount: number;
    is_goal_reached: boolean;
    is_completed: boolean;
}

interface Props {
    campaign: Campaign;
}

interface AuthProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    [key: string]: any;
}

interface CashFormData {
    donation_type: 'cash';
    amount: string;
    message: string;
    [key: string]: any;
}

interface ItemFormData {
    donation_type: 'items';
    message: string;
    items: Array<{
        name: string;
        quantity: number;
        description: string;
    }>;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Donate to Campaign',
        href: '#',
    },
];

export default function AuthenticatedDonateToCampaignPage({ campaign }: Props) {
    const { auth } = usePage<AuthProps>().props;
    const [activeTab, setActiveTab] = useState('cash');
    const [items, setItems] = useState([{ name: '', quantity: 1, description: '' }]);

    const [loading, setLoading] = useState(false);

    // Cash donation state
    const [amount, setAmount] = useState('');
    const [cashMessage, setCashMessage] = useState('');

    // Item donation state
    const [itemMessage, setItemMessage] = useState('');

    const addItem = () => {
        const newItems = [...items, { name: '', quantity: 1, description: '' }];
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleCashSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                donation_type: 'cash',
                amount: parseFloat(amount),
                message: cashMessage || null,
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log(csrfToken)

            const response = await fetch(`/campaigns/${campaign.id}/donate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            // Check if response is JSON or text (URL)
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Response is likely a URL string
                const url = await response.text();
                data = { checkout_url: url };
            }

            if (!response.ok) {
                // Handle validation errors
                if (response.status === 422 && data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    errorMessages.forEach((error: any) => {
                        toast.error(error);
                    });
                } else {
                    toast.error(data.message || 'Donation failed. Please try again.');
                }
                return;
            }

            if (data.checkout_url) {
                toast.success('Payment form generated! Redirecting to PayChangu...');
                setTimeout(() => {
                    window.location.href = data.checkout_url;
                }, 1000);
            } else {
                toast.success('Donation submitted successfully!');
            }
        } catch (error) {
            console.error('Donation error:', error);
            toast.error('Failed to submit donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                donation_type: 'items',
                message: itemMessage || null,
                items: items.filter((item) => item.name.trim() && item.quantity > 0),
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log(csrfToken)

            const response = await fetch(`/campaigns/${campaign.id}/donate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (response.status === 422 && data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    errorMessages.forEach((error: any) => {
                        toast.error(error);
                    });
                } else {
                    toast.error(data.message || 'Donation failed. Please try again.');
                }
                return;
            }

            toast.success('Item donation submitted successfully!');
            // Reset form
            setItems([{ name: '', quantity: 1, description: '' }]);
            setAmount('');
            setCashMessage('');
            setItemMessage('');
        } catch (error) {
            console.error('Donation error:', error);
            toast.error('Failed to submit donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Donate to Campaign`} />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support This Campaign</h1>
                        <p className="text-gray-600">Make a difference with your donation</p>
                    </div>
                </div>

                {/* User Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Donating as
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{auth.user.name}</p>
                                <p className="text-sm text-gray-600">{auth.user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Campaign Info */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Campaign Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Created by {campaign.created_by} on {campaign.created_at}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{campaign.message}</p>
                                    </div>

                                    {/* Progress Bar */}
                                    {campaign.target_amount && (
                                        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">Campaign Progress</h4>
                                                {campaign.is_completed && (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                        Goal Reached!
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Progress</span>
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
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>MWK {campaign.total_raised.toLocaleString()} raised</span>
                                                    <span>MWK {campaign.target_amount.toLocaleString()} goal</span>
                                                </div>
                                                {!campaign.is_completed && (
                                                    <p className="text-sm text-gray-500">
                                                        MWK {campaign.remaining_amount.toLocaleString()} remaining to reach goal
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {campaign.images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {campaign.images.slice(0, 4).map((image) => (
                                                <img
                                                    key={image.id}
                                                    src={image.url}
                                                    alt={image.original_name}
                                                    className="h-24 w-full rounded object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Donation Form */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Make Your Donation</CardTitle>
                                <CardDescription>
                                    Choose how you'd like to support this campaign. Note that you are donating anonymously. We only require your name
                                    or email so that we can email your receipt
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="cash" className="flex items-center gap-2">
                                            {/* <DollarSign className="h-4 w-4" /> */}
                                            Cash Donation
                                        </TabsTrigger>
                                        <TabsTrigger value="items" className="flex items-center gap-2">
                                            <Gift className="h-4 w-4" />
                                            Item Donation
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="cash">
                                        <form onSubmit={handleCashSubmit} className="space-y-4">
                                            <div>
                                                <Label htmlFor="amount">Donation Amount (MWK) *</Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    min="100"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="Enter amount in MWK"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="cash_message">Message (Optional)</Label>
                                                <Textarea
                                                    id="cash_message"
                                                    value={cashMessage}
                                                    onChange={(e) => setCashMessage(e.target.value)}
                                                    placeholder="Add a personal message with your donation..."
                                                    rows={3}
                                                />
                                            </div>

                                            <Button type="submit" disabled={loading} className="w-full">
                                                {loading ? 'Processing...' : 'Donate Now'}
                                            </Button>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="items">
                                        <form onSubmit={handleItemSubmit} className="space-y-4">
                                            <div>
                                                <Label>Items to Donate *</Label>
                                                <div className="space-y-3">
                                                    {items.map((item, index) => (
                                                        <div key={index} className="rounded-lg border p-3">
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <span className="text-sm font-medium">Item {index + 1}</span>
                                                                {items.length > 1 && (
                                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                                <Input
                                                                    placeholder="Item name"
                                                                    value={item.name}
                                                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                                    required
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="Quantity"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                                    required
                                                                />
                                                                <Input
                                                                    placeholder="Description (optional)"
                                                                    value={item.description}
                                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Another Item
                                                </Button>
                                            </div>

                                            <div>
                                                <Label htmlFor="item_message">Message (Optional)</Label>
                                                <Textarea
                                                    id="item_message"
                                                    value={itemMessage}
                                                    onChange={(e) => setItemMessage(e.target.value)}
                                                    placeholder="Add a personal message with your donation..."
                                                    rows={3}
                                                />
                                            </div>

                                            <Button type="submit" disabled={loading} className="w-full">
                                                {loading ? 'Submitting...' : 'Submit Item Donation'}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Gift, Heart, Plus, User, X } from 'lucide-react';
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

    const {
        data: cashData,
        setData: setCashData,
        post: postCash,
        processing: processingCash,
        errors: cashErrors,
    } = useForm<CashFormData>({
        donation_type: 'cash',
        amount: '',
        message: '',
    });

    const {
        data: itemData,
        setData: setItemData,
        post: postItem,
        processing: processingItem,
    } = useForm<ItemFormData>({
        donation_type: 'items',
        message: '',
        items: [{ name: '', quantity: 1, description: '' }],
    });

    const addItem = () => {
        const newItems = [...items, { name: '', quantity: 1, description: '' }];
        setItems(newItems);
        setItemData('items', newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        setItemData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
        setItemData('items', newItems);
    };

    const handleCashSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        postCash(`/campaigns/${campaign.id}/donate`, {
            onSuccess: () => {
                toast.success('Redirecting to payment...');
            },
            onError: () => {
                toast.error('Failed to submit donation. Please try again.');
            },
        });
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        postItem(`/campaigns/${campaign.id}/donate`, {
            onSuccess: () => {
                toast.success('Item donation submitted successfully!');
                // Reset form
                setItems([{ name: '', quantity: 1, description: '' }]);
                setItemData({
                    donation_type: 'items',
                    message: '',
                    items: [{ name: '', quantity: 1, description: '' }],
                });
            },
            onError: () => {
                toast.error('Failed to submit donation. Please try again.');
            },
        });
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
                                <CardDescription>Choose how you'd like to support this campaign</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="cash" className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
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
                                                    value={cashData.amount}
                                                    onChange={(e) => setCashData('amount', e.target.value)}
                                                    placeholder="Enter amount in MWK"
                                                    required
                                                />
                                                {cashErrors.amount && <p className="text-sm text-red-600">{cashErrors.amount}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="cash_message">Message (Optional)</Label>
                                                <Textarea
                                                    id="cash_message"
                                                    value={cashData.message}
                                                    onChange={(e) => setCashData('message', e.target.value)}
                                                    placeholder="Add a personal message with your donation..."
                                                    rows={3}
                                                />
                                            </div>

                                            <Button type="submit" disabled={processingCash} className="w-full">
                                                {processingCash ? 'Processing...' : 'Donate Now'}
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
                                                    value={itemData.message}
                                                    onChange={(e) => setItemData('message', e.target.value)}
                                                    placeholder="Add a personal message with your donation..."
                                                    rows={3}
                                                />
                                            </div>

                                            <Button type="submit" disabled={processingItem} className="w-full">
                                                {processingItem ? 'Submitting...' : 'Submit Item Donation'}
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

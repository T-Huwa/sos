import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/public-layout';
import { Head, usePage } from '@inertiajs/react';
import { DollarSign, Gift, Heart, Plus, X } from 'lucide-react';
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
        user?: {
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
    anonymous_name?: string;
    anonymous_email?: string;
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
    anonymous_name?: string;
    anonymous_email?: string;
    [key: string]: any;
}

// No breadcrumbs needed for public layout

export default function DonateToCampaignPage({ campaign }: Props) {
    const { auth } = usePage<AuthProps>().props;
    const [activeTab, setActiveTab] = useState('cash');
    const [items, setItems] = useState([{ name: '', quantity: 1, description: '' }]);
    const [loading, setLoading] = useState(false);

    // Cash donation state
    const [amount, setAmount] = useState('');
    const [cashMessage, setCashMessage] = useState('');
    const [cashAnonymousName, setCashAnonymousName] = useState('');
    const [cashAnonymousEmail, setCashAnonymousEmail] = useState('');

    // Item donation state
    const [itemMessage, setItemMessage] = useState('');
    const [itemAnonymousName, setItemAnonymousName] = useState('');
    const [itemAnonymousEmail, setItemAnonymousEmail] = useState('');

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
            const route = auth.user ? `/campaigns/${campaign.id}/donate` : `/campaigns/${campaign.id}/donate/anonymous`;

            const payload = {
                donation_type: 'cash',
                amount: parseFloat(amount),
                message: cashMessage || null,
                ...(auth.user
                    ? {}
                    : {
                          anonymous_name: cashAnonymousName,
                          anonymous_email: cashAnonymousEmail,
                      }),
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(route, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
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
            const route = auth.user ? `/campaigns/${campaign.id}/donate` : `/campaigns/${campaign.id}/donate/anonymous`;

            const payload = {
                donation_type: 'items',
                message: itemMessage || null,
                items: items.filter((item) => item.name.trim() && item.quantity > 0),
                ...(auth.user
                    ? {}
                    : {
                          anonymous_name: itemAnonymousName,
                          anonymous_email: itemAnonymousEmail,
                      }),
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(route, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
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

            // Show detailed success message for anonymous users
            if (auth.user) {
                toast.success('Item donation submitted successfully!');
            } else {
                toast.success(
                    'Thank you for your generous donation! Your items have been submitted successfully. We will contact you at the provided email address for coordination.',
                );
            }

            // Reset form
            setItems([{ name: '', quantity: 1, description: '' }]);
            setAmount('');
            setCashMessage('');
            setCashAnonymousName('');
            setCashAnonymousEmail('');
            setItemMessage('');
            setItemAnonymousName('');
            setItemAnonymousEmail('');
        } catch (error) {
            console.error('Donation error:', error);
            toast.error('Failed to submit donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <Head title={`Donate to Campaign`} />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support This Campaign</h1>
                        <p className="text-gray-600">Make a difference with your donation</p>
                    </div>
                </div>

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
                                            {!auth.user && (
                                                <div className="space-y-4 rounded-lg bg-blue-50 p-4">
                                                    <h4 className="font-medium text-blue-900">Your Information</h4>
                                                    {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> */}
                                                    <div>
                                                        <div>
                                                            {/* <Label htmlFor="anonymous_name">Full Name *</Label> */}
                                                            <Input
                                                                id="anonymous_name"
                                                                value={'Anonymous donor'}
                                                                onChange={(e) => setCashAnonymousName(e.target.value)}
                                                                required
                                                                hidden
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="anonymous_email">Email *</Label>
                                                            <Input
                                                                id="anonymous_email"
                                                                type="email"
                                                                value={cashAnonymousEmail}
                                                                onChange={(e) => setCashAnonymousEmail(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

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
                                            {!auth.user && (
                                                <div className="space-y-4 rounded-lg bg-blue-50 p-4">
                                                    <h4 className="font-medium text-blue-900">Your Information</h4>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <Label htmlFor="item_anonymous_name">Full Name *</Label>
                                                            <Input
                                                                id="item_anonymous_name"
                                                                value={itemAnonymousName}
                                                                onChange={(e) => setItemAnonymousName(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="item_anonymous_email">Email *</Label>
                                                            <Input
                                                                id="item_anonymous_email"
                                                                type="email"
                                                                value={itemAnonymousEmail}
                                                                onChange={(e) => setItemAnonymousEmail(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

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
        </PublicLayout>
    );
}

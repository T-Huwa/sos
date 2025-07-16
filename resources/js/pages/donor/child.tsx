'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Gift, Heart, Package, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DonatedItem {
    name: string;
    quantity: number;
    description: string;
}

interface Child {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    education_level?: string;
    health_status?: string;
    image?: string;
}

interface Donation {
    id: number;
    amount?: number;
    donation_type: string;
    status: string;
    created_at: string;
    donor: {
        name: string;
        email: string;
    };
}

interface Props {
    child: Child;
    donations: Donation[];
    donors: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/donor/dashboard',
    },
    {
        title: 'Children',
        href: '/donor/children',
    },
];

export default function DonorChildViewPage() {
    const { child, donations, donors } = usePage().props as any;

    // Donation form state
    const [showDonationForm, setShowDonationForm] = useState(false);
    const [donationType, setDonationType] = useState<'cash' | 'items'>('cash');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Item donation fields
    const [items, setItems] = useState<DonatedItem[]>([{ name: '', quantity: 1, description: '' }]);

    const getAge = (dateString: string) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthdayThisYear =
            today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

        if (!hasHadBirthdayThisYear) {
            age--;
        }

        return age;
    };

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, description: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof DonatedItem, value: string | number) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setItems(updatedItems);
    };

    const validateForm = () => {
        if (donationType === 'cash') {
            if (!amount || parseFloat(amount) <= 0) {
                toast.error('Please enter a valid donation amount.');
                return false;
            }
        } else {
            const validItems = items.filter((item) => item.name.trim() && item.quantity > 0);
            if (validItems.length === 0) {
                toast.error('Please add at least one item with a name and quantity.');
                return false;
            }
        }
        return true;
    };

    const handleDonate = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                donation_type: donationType,
                child_id: child.id,
                message: message || null,
                ...(donationType === 'cash'
                    ? { amount: parseFloat(amount) }
                    : { items: items.filter((item) => item.name.trim() && item.quantity > 0) }),
            };

            const response = await fetch('/donor/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Donation failed');
            }

            if (donationType === 'cash' && data.checkout_url) {
                // Redirect to PayChangu for payment
                window.location.href = data.checkout_url;
            } else {
                toast.success('Thank you for your donation!');
                // Reset form
                setAmount('');
                setMessage('');
                setItems([{ name: '', quantity: 1, description: '' }]);
                setShowDonationForm(false);
                // Refresh page to show new donation
                window.location.reload();
            }
        } catch (error) {
            console.error('Donation error:', error);
            toast.error('Donation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number | undefined, type: string) => {
        if (type === 'goods') return 'Items';
        return amount ? `MWK ${amount.toLocaleString()}` : 'N/A';
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
            <Head title={`${child.first_name} ${child.last_name}`} />
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="outline" asChild>
                        <Link href="/donor/children">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Children
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Child Profile Card */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                        <User className="h-6 w-6" />
                                        {child.first_name} {child.last_name}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-sm">
                                        Age {getAge(child.date_of_birth)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Child Photo */}
                                {child.image && (
                                    <div className="flex justify-center">
                                        <img
                                            src={child.image}
                                            alt={`${child.first_name} ${child.last_name}`}
                                            className="h-48 w-48 rounded-full border-4 border-gray-300 object-cover shadow-md"
                                        />
                                    </div>
                                )}

                                {/* Child Info */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Date of Birth:</span>
                                            <span className="font-medium">{formatDate(child.date_of_birth)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Gender:</span>
                                            <span className="font-medium capitalize">{child.gender}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Education:</span>
                                            <span className="font-medium">{child.education_level || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-gray-600">Health Status:</span>
                                            <span className="font-medium">{child.health_status || 'Healthy'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Donations History */}
                                <div className="border-t pt-6">
                                    <h3 className="mb-4 text-lg font-semibold">Donation History</h3>
                                    {donations && donations.length > 0 ? (
                                        <div className="space-y-3">
                                            {donations.slice(0, 5).map((donation: any) => (
                                                <div key={donation.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                            {donation.donation_type === 'money' ? (
                                                                <Gift className="h-4 w-4 text-blue-600" />
                                                            ) : (
                                                                <Package className="h-4 w-4 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{donation?.donor?.name || 'Anonymous'}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {formatAmount(donation.amount, donation.donation_type)} •{' '}
                                                                {formatDate(donation.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={getStatusBadgeVariant(donation.status)}>
                                                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {donations.length > 5 && (
                                                <p className="text-center text-sm text-gray-500">And {donations.length - 5} more donations...</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <Gift className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-gray-500">No donations yet for this child.</p>
                                            <p className="text-sm text-gray-400">Be the first to make a difference!</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Donation Form Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Make a Donation
                                </CardTitle>
                                <p className="text-sm text-gray-600">Support {child.first_name} with your generous contribution</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!showDonationForm ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                            Your donation will directly help {child.first_name} {child.last_name} with their needs.
                                        </p>
                                        <Button className="w-full" onClick={() => setShowDonationForm(true)} size="lg">
                                            <Gift className="mr-2 h-4 w-4" />
                                            Donate Now
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Donation Type Selection */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Donation Type</Label>
                                            <div className="flex space-x-4">
                                                <label className="flex cursor-pointer items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="donationType"
                                                        value="cash"
                                                        checked={donationType === 'cash'}
                                                        onChange={(e) => setDonationType(e.target.value as 'cash' | 'items')}
                                                        disabled={loading}
                                                        className="h-4 w-4"
                                                    />
                                                    <Gift className="h-4 w-4" />
                                                    <span className="text-sm">Cash</span>
                                                </label>
                                                <label className="flex cursor-pointer items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="donationType"
                                                        value="items"
                                                        checked={donationType === 'items'}
                                                        onChange={(e) => setDonationType(e.target.value as 'cash' | 'items')}
                                                        disabled={loading}
                                                        className="h-4 w-4"
                                                    />
                                                    <Package className="h-4 w-4" />
                                                    <span className="text-sm">Items</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Cash Donation Fields */}
                                        {donationType === 'cash' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="amount">Amount (MWK) *</Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    disabled={loading}
                                                    min="1"
                                                    required
                                                />
                                                <p className="text-xs text-gray-600">You will be redirected to PayChangu to complete payment.</p>
                                            </div>
                                        )}

                                        {/* Item Donation Fields */}
                                        {donationType === 'items' && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-medium">Items to Donate *</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={loading}>
                                                        Add Item
                                                    </Button>
                                                </div>
                                                {items.map((item, index) => (
                                                    <div key={index} className="space-y-3 rounded-lg border p-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`item-name-${index}`} className="text-xs">
                                                                Item Name *
                                                            </Label>
                                                            <Input
                                                                id={`item-name-${index}`}
                                                                placeholder="e.g., School supplies"
                                                                value={item.name}
                                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                                disabled={loading}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`item-quantity-${index}`} className="text-xs">
                                                                    Quantity *
                                                                </Label>
                                                                <Input
                                                                    id={`item-quantity-${index}`}
                                                                    type="number"
                                                                    placeholder="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                                    disabled={loading}
                                                                    min="1"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="flex items-end">
                                                                {items.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeItem(index)}
                                                                        disabled={loading}
                                                                        className="w-full"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`item-description-${index}`} className="text-xs">
                                                                Description
                                                            </Label>
                                                            <Textarea
                                                                id={`item-description-${index}`}
                                                                placeholder="Brief description"
                                                                value={item.description}
                                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                disabled={loading}
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Optional Message */}
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Optional Message</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Leave a kind note (optional)"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                disabled={loading}
                                                rows={3}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDonationForm(false)}
                                                disabled={loading}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={handleDonate} disabled={loading} className="flex-1">
                                                {loading ? 'Processing...' : donationType === 'cash' ? 'Proceed to Payment' : 'Submit Donation'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

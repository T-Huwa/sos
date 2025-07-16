import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Gift, Heart, Package, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DonatedItem {
    name: string;
    quantity: number;
    description: string;
}

interface Child {
    id: number;
    date_of_birth: string;
    first_name: string;
    last_name: string;
    school?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/donor/dashboard',
    },
    {
        title: 'Make Donation',
        href: '/donor/donate',
    },
];

export default function DonorDonatePage() {
    const { auth } = usePage().props as any;
    const [donationType, setDonationType] = useState<'cash' | 'items'>('cash');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Child selection
    const [donatingToChild, setDonatingToChild] = useState(false);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [children, setChildren] = useState<Child[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);

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

    useEffect(() => {
        if (donatingToChild) {
            fetchChildren();
        }
    }, [donatingToChild]);

    const fetchChildren = async () => {
        setLoadingChildren(true);
        try {
            const response = await fetch('/children', {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setChildren(data);
            }
        } catch (error) {
            console.error('Failed to fetch children:', error);
            toast.error('Failed to load children list');
        } finally {
            setLoadingChildren(false);
        }
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

        if (donatingToChild && !selectedChildId) {
            toast.error('Please select a child to donate to.');
            return false;
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
                child_id: donatingToChild ? parseInt(selectedChildId) : null,
                message: message || null,
                ...(donationType === 'cash'
                    ? { amount: parseFloat(amount) }
                    : { items: items.filter((item) => item.name.trim() && item.quantity > 0) }),
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/donor/donations', {
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
                setSelectedChildId('');
                setDonatingToChild(false);
            }
        } catch (error) {
            console.error('Donation error:', error);
            toast.error('Donation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Make Donation" />
            <div className="container mx-auto px-4 py-8">
                <Card className="mx-auto max-w-2xl rounded-2xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-center text-2xl font-bold">
                            <Heart className="h-6 w-6 text-red-500" />
                            Make a Donation
                        </CardTitle>
                        <p className="text-center text-gray-600">Support children in need with your generous contribution</p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        {/* Donation Type Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Donation Type</h3>
                            <div className="flex space-x-6">
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
                                    <span>Cash Donation</span>
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
                                    <span>Item Donation</span>
                                </label>
                            </div>
                        </div>

                        {/* Child Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="donateToChild"
                                    checked={donatingToChild}
                                    onChange={(e) => setDonatingToChild(e.target.checked)}
                                    disabled={loading}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="donateToChild" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Donate to a specific child
                                </Label>
                            </div>

                            {donatingToChild && (
                                <div className="space-y-2">
                                    <Label htmlFor="childSelect">Select Child</Label>
                                    <Select value={selectedChildId} onValueChange={setSelectedChildId} disabled={loading || loadingChildren}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingChildren ? 'Loading children...' : 'Choose a child'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {children.map((child) => (
                                                <SelectItem key={child.id} value={child.id.toString()}>
                                                    {child.first_name} {child.last_name} (Age: {getAge(child.date_of_birth)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
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
                                <p className="text-sm text-gray-600">You will be redirected to PayChangu to complete your payment.</p>
                            </div>
                        )}

                        {/* Item Donation Fields */}
                        {donationType === 'items' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Items to Donate *</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={loading}>
                                        Add Item
                                    </Button>
                                </div>
                                {items.map((item, index) => (
                                    <div key={index} className="rounded-lg border p-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor={`item-name-${index}`}>Item Name *</Label>
                                                <Input
                                                    id={`item-name-${index}`}
                                                    placeholder="e.g., School supplies"
                                                    value={item.name}
                                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`item-quantity-${index}`}>Quantity *</Label>
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
                                        <div className="mt-4 space-y-2">
                                            <Label htmlFor={`item-description-${index}`}>Description</Label>
                                            <Textarea
                                                id={`item-description-${index}`}
                                                placeholder="Brief description of the item(s)"
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
                                placeholder="Leave a kind note or intention (optional)"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button className="w-full" onClick={handleDonate} disabled={loading} size="lg">
                            {loading ? 'Processing...' : donationType === 'cash' ? 'Proceed to Payment' : 'Submit Item Donation'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

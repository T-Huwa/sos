import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface DonatedItem {
    name: string;
    quantity: number;
    description: string;
}

const AnonymousDonationForm: React.FC = () => {
    const [donationType, setDonationType] = useState<'cash' | 'items'>('cash');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Anonymous donor information
    const [donorName, setDonorName] = useState('Anonymous donor');
    const [donorEmail, setDonorEmail] = useState('');

    // Item donation fields
    const [items, setItems] = useState<DonatedItem[]>([{ name: '', quantity: 1, description: '' }]);

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Helper function to get error message for a field
    const getFieldError = (fieldName: string) => {
        return errors[fieldName] ? errors[fieldName][0] : '';
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
        if (!donorName.trim()) {
            toast.error('Please enter your name.');
            return false;
        }
        if (donorName.length > 255) {
            toast.error('Name is too long (max 255 characters).');
            return false;
        }
        if (!donorEmail.trim()) {
            toast.error('Please enter your email.');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(donorEmail)) {
            toast.error('Please enter a valid email address.');
            return false;
        }
        if (donorEmail.length > 255) {
            toast.error('Email is too long (max 255 characters).');
            return false;
        }

        if (donationType === 'cash') {
            if (!amount || parseFloat(amount) <= 0) {
                toast.error('Please enter a valid donation amount.');
                return false;
            }
            if (parseFloat(amount) < 100) {
                toast.error('Minimum donation amount is MWK 100.');
                return false;
            }
        } else {
            const validItems = items.filter((item) => item.name.trim() && item.quantity > 0);
            if (validItems.length === 0) {
                toast.error('Please add at least one item with a name and quantity.');
                return false;
            }

            // Validate each item more thoroughly
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.name.trim()) {
                    if (item.name.length > 255) {
                        toast.error(`Item #${i + 1} name is too long (max 255 characters).`);
                        return false;
                    }
                    if (item.quantity < 1) {
                        toast.error(`Item #${i + 1} must have a quantity of at least 1.`);
                        return false;
                    }
                    if (item.description && item.description.length > 500) {
                        toast.error(`Item #${i + 1} description is too long (max 500 characters).`);
                        return false;
                    }
                }
            }
        }

        if (message && message.length > 1000) {
            toast.error('Message is too long (max 1000 characters).');
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
                anonymous_name: donorName,
                anonymous_email: donorEmail,
                message: message || null,
                ...(donationType === 'cash'
                    ? { amount: parseFloat(amount) }
                    : { items: items.filter((item) => item.name.trim() && item.quantity > 0) }),
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log(csrfToken);

            const res = await fetch('/anonymous-donation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', res.status, 'OK:', res.ok);

            // Check if response is JSON or text (URL)
            const contentType = res.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
                console.log('Response data:', data);
            } else {
                // Response is likely a URL string
                const url = await res.text();
                data = { checkout_url: url };
                console.log('Response URL:', url);
            }

            if (!res.ok) {
                // Handle validation errors
                if (res.status === 422 && data.errors) {
                    // Set validation errors for form display
                    setErrors(data.errors);

                    // Display validation errors as toasts
                    const errorMessages = Object.values(data.errors).flat();
                    errorMessages.forEach((error: any) => {
                        toast.error(error);
                    });
                } else if (res.status === 422) {
                    // Single validation error message
                    toast.error(data.message || 'Please check your input and try again.');
                } else if (res.status === 500) {
                    // Server error
                    toast.error('Server error occurred. Please try again later or contact support.');
                } else {
                    // Other errors
                    toast.error(data.message || 'Donation failed. Please try again.');
                }
                return;
            }

            // Clear any previous errors on successful submission
            setErrors({});

            if (donationType === 'cash' && data.checkout_url) {
                // Show feedback before redirect
                const successMessage = 'Payment form generated! Redirecting to PayChangu...';

                try {
                    toast.success(successMessage);
                } catch (toastError) {
                    alert(successMessage);
                }

                // Small delay to show the feedback
                setTimeout(() => {
                    window.location.href = data.checkout_url;
                }, 1500);
            } else if (donationType === 'items' && data.success) {
                // Handle successful item donation
                console.log('Item donation successful, showing success message');
                toast.success(data.message || 'Thank you for your item donation!');

                // Reset form
                setAmount('');
                setMessage('');
                setDonorName('Anonymous donor');
                setDonorEmail('');
                setItems([{ name: '', quantity: 1, description: '' }]);

                // Show additional success message
                setTimeout(() => {
                    toast.success('We will contact you soon to arrange pickup of your donated items.');
                }, 2000);
            } else {
                console.log('Fallback success handler triggered');
                toast.success('Thank you for your anonymous donation!');
                // Reset form
                setAmount('');
                setMessage('');
                setDonorName('Anonymous donor');
                setDonorEmail('');
                setItems([{ name: '', quantity: 1, description: '' }]);
            }
        } catch (error) {
            console.error('Donation error:', error);
            const errorMessage = 'Donation failed. Please try again.';

            // Try toast first, fallback to alert
            try {
                toast.error(errorMessage);
            } catch (toastError) {
                alert(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto mt-10 max-w-2xl rounded-2xl shadow-2xl">
            <CardContent className="space-y-6 p-6">
                <h2 className="text-center text-2xl font-bold">Anonymous Donation</h2>

                {/* Donor Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Information</h3>
                    {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> */}
                    <div>
                        <div className="space-y-2">
                            {/* <Label htmlFor="donorName">Your Name *</Label> */}
                            <Input
                                id="donorName"
                                placeholder="Enter your name"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                disabled={loading}
                                required
                                hidden
                                className={getFieldError('anonymous_name') ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {getFieldError('anonymous_name') && <p className="text-sm text-red-600">{getFieldError('anonymous_name')}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="donorEmail">Your Email *</Label>
                            <Input
                                id="donorEmail"
                                type="email"
                                placeholder="Enter your email"
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                disabled={loading}
                                required
                                className={getFieldError('anonymous_email') ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {getFieldError('anonymous_email') && <p className="text-sm text-red-600">{getFieldError('anonymous_email')}</p>}
                        </div>
                    </div>
                </div>

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
                            <span>Item Donation</span>
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
                            placeholder="Enter amount (minimum MWK 100)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                            required
                            className={getFieldError('amount') ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {getFieldError('amount') && <p className="text-sm text-red-600">{getFieldError('amount')}</p>}
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
    );
};

export default AnonymousDonationForm;

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Package, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ExistingItem {
    item_name: string;
    category: string;
    location: string;
    current_quantity: number;
    threshold: number;
}

interface NewItem {
    item_name: string;
    quantity: number;
    threshold: number;
    reason: string;
    notes: string;
}

interface Adjustment {
    item_name: string;
    quantity_change: number;
    reason: string;
    notes: string;
}

interface Props {
    existingItems: ExistingItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/inventory/dashboard',
    },
    {
        title: 'Inventory',
        href: '/inventory/inventory',
    },
    {
        title: 'Mass Requisition',
        href: '/inventory/mass-requisition',
    },
];

export default function MassRequisitionPage({ existingItems }: Props) {
    const [newItems, setNewItems] = useState<NewItem[]>([]);
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [processing, setProcessing] = useState(false);
    const { props } = usePage();

    // Handle flash messages
    useEffect(() => {
        if (props.success) {
            toast.success(props.success.message);
        }
        if (props.error) {
            toast.error(props.error.message);
        }
    }, [props.success, props.error]);

    const addNewItem = () => {
        const newItem: NewItem = {
            item_name: '',
            quantity: 1,
            threshold: 20,
            reason: '',
            notes: '',
        };
        setNewItems([...newItems, newItem]);
    };

    const removeNewItem = (index: number) => {
        setNewItems(newItems.filter((_, i) => i !== index));
    };

    const updateNewItem = (index: number, field: keyof NewItem, value: string | number) => {
        const updated = [...newItems];
        updated[index] = { ...updated[index], [field]: value };
        setNewItems(updated);
    };

    const addAdjustment = () => {
        const adjustment: Adjustment = {
            item_name: existingItems[0]?.item_name || '',
            quantity_change: 0,
            reason: '',
            notes: '',
        };
        setAdjustments([...adjustments, adjustment]);
    };

    const removeAdjustment = (index: number) => {
        setAdjustments(adjustments.filter((_, i) => i !== index));
    };

    const updateAdjustment = (index: number, field: keyof Adjustment, value: string | number) => {
        const updated = [...adjustments];
        updated[index] = { ...updated[index], [field]: value };
        setAdjustments(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Form submitted! newItems:', newItems, 'adjustments:', adjustments);

        if (newItems.length === 0 && adjustments.length === 0) {
            toast.error('Please add at least one new item or adjustment');
            return;
        }

        console.log('Submitting data:', { new_items: newItems, adjustments: adjustments });
        toast.info('Submitting mass requisition...');

        setProcessing(true);

        // Use router.post directly with the data
        router.post(
            route('inventory.mass-requisition.process'),
            {
                new_items: newItems,
                adjustments: adjustments,
            },
            {
                onSuccess: () => {
                    // Success message will be shown via flash message
                    setNewItems([]);
                    setAdjustments([]);
                    setProcessing(false);
                },
                onError: (errors) => {
                    // Error message will be shown via flash message
                    console.error('Form submission errors:', errors);
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const getExistingItemBySelection = (itemName: string) => {
        return existingItems.find((item) => item.item_name === itemName);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mass Requisition" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mass Requisition</h1>
                        <p className="text-muted-foreground">Add new inventory items or adjust existing quantities</p>
                    </div>
                    <Link href="/inventory/inventory">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Add New Items
                            </CardTitle>
                            <CardDescription>Create new inventory items with initial quantities</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {newItems.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No new items added yet. Click "Add New Item" to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {newItems.map((item, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <Label htmlFor={`new-item-name-${index}`}>Item Name *</Label>
                                                    <Input
                                                        id={`new-item-name-${index}`}
                                                        value={item.item_name}
                                                        onChange={(e) => updateNewItem(index, 'item_name', e.target.value)}
                                                        placeholder="Enter item name"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`new-quantity-${index}`}>Quantity *</Label>
                                                    <Input
                                                        id={`new-quantity-${index}`}
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateNewItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor={`new-threshold-${index}`}>Low Stock Threshold</Label>
                                                    <Input
                                                        id={`new-threshold-${index}`}
                                                        type="number"
                                                        min="1"
                                                        value={item.threshold}
                                                        onChange={(e) => updateNewItem(index, 'threshold', parseInt(e.target.value) || 20)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`new-reason-${index}`}>Reason *</Label>
                                                    <Input
                                                        id={`new-reason-${index}`}
                                                        value={item.reason}
                                                        onChange={(e) => updateNewItem(index, 'reason', e.target.value)}
                                                        placeholder="e.g., New donation, Purchase"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label htmlFor={`new-notes-${index}`}>Notes</Label>
                                                    <Textarea
                                                        id={`new-notes-${index}`}
                                                        value={item.notes}
                                                        onChange={(e) => updateNewItem(index, 'notes', e.target.value)}
                                                        placeholder="Additional notes..."
                                                        rows={2}
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeNewItem(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <Button type="button" onClick={addNewItem} variant="outline" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Item
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing || (newItems.length === 0 && adjustments.length === 0)} className="flex-1">
                            {processing ? 'Processing...' : 'Process Mass Requisition'}
                        </Button>
                        <Link href="/inventory/inventory">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

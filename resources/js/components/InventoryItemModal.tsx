import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Minus, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InventoryItem {
    id: number;
    item_name: string;
    total_quantity: number;
    category: string;
    location: string;
    threshold: number;
    status: string;
    first_added?: string;
    last_updated?: string;
}

interface InventoryItemModalProps {
    item: InventoryItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function InventoryItemModal({ item, isOpen, onClose }: InventoryItemModalProps) {
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'reduce'>('add');
    const [amount, setAmount] = useState<number>(1);
    const [reason, setReason] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    if (!item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!reason.trim()) {
            toast.error('Please provide a reason for the adjustment');
            return;
        }

        setProcessing(true);

        const quantityChange = adjustmentType === 'add' ? amount : -amount;

        router.post(
            route('inventory.adjust-quantity'),
            {
                item_id: item.id,
                quantity_change: quantityChange,
                reason: reason.trim(),
                notes: notes.trim(),
            },
            {
                onSuccess: () => {
                    toast.success(`Successfully ${adjustmentType === 'add' ? 'added' : 'reduced'} ${amount} ${item.item_name}`);
                    onClose();
                    resetForm();
                },
                onError: (errors) => {
                    console.error('Adjustment failed:', errors);
                    if (errors.message) {
                        toast.error(errors.message);
                    } else {
                        toast.error('Failed to adjust quantity. Please try again.');
                    }
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const resetForm = () => {
        setAdjustmentType('add');
        setAmount(1);
        setReason('');
        setNotes('');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Critical':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'Low':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Good':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            default:
                return <Package className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'Low':
                return 'bg-yellow-100 text-yellow-800';
            case 'Good':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const newQuantity = adjustmentType === 'add' ? item.total_quantity + amount : item.total_quantity - amount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-screen max-w-md overflow-scroll">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {item.item_name}
                    </DialogTitle>
                    <DialogDescription>View details and adjust quantity for this inventory item</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Item Details */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Current Quantity:</span>
                            <span className="text-lg font-bold">{item.total_quantity}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge className={getStatusColor(item.status)}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Category:</span>
                            <span className="text-sm text-gray-600">{item.category}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Location:</span>
                            <span className="text-sm text-gray-600">{item.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Low Stock Threshold:</span>
                            <span className="text-sm text-gray-600">{item.threshold}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Quantity Adjustment Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Adjustment Type</Label>
                            <div className="mt-2 flex gap-2">
                                <Button
                                    type="button"
                                    variant={adjustmentType === 'add' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setAdjustmentType('add')}
                                    className="flex-1"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add
                                </Button>
                                <Button
                                    type="button"
                                    variant={adjustmentType === 'reduce' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setAdjustmentType('reduce')}
                                    className="flex-1"
                                >
                                    <Minus className="mr-1 h-4 w-4" />
                                    Reduce
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="amount">Amount *</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                max={adjustmentType === 'reduce' ? item.total_quantity : undefined}
                                value={amount}
                                onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                                required
                            />
                            {adjustmentType === 'reduce' && amount > item.total_quantity && (
                                <p className="mt-1 text-sm text-red-600">Cannot reduce more than current quantity ({item.total_quantity})</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="reason">Reason *</Label>
                            <Input
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Damaged items, New stock, Donation"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional details..."
                                rows={2}
                            />
                        </div>

                        {/* Preview */}
                        <div className="rounded-md bg-gray-50 p-3">
                            <div className="flex items-center justify-between text-sm">
                                <span>New Quantity:</span>
                                <span className="font-medium">
                                    {item.total_quantity} → {newQuantity}
                                    <span className={`ml-2 ${adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                                        ({adjustmentType === 'add' ? '+' : '-'}
                                        {amount})
                                    </span>
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || (adjustmentType === 'reduce' && amount > item.total_quantity)}>
                                {processing ? 'Processing...' : `${adjustmentType === 'add' ? 'Add' : 'Reduce'} Quantity`}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

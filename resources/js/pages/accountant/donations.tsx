import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Gift, Mail, Package, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface DonatedItem {
    id: number;
    item_name: string;
    quantity: number;
    estimated_value?: number;
    in_inventory?: boolean;
}

interface Donation {
    id: number;
    created_at: string;
    donation_type: 'money' | 'goods';
    amount?: number;
    status: string;
    description?: string;
    donor_name: string;
    donor_email: string;
    child_name?: string;
    is_anonymous: boolean;
    items: DonatedItem[];
}

interface Props {
    donations: Donation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/accountant/dashboard',
    },
    {
        title: 'Donations',
        href: '/accountant/donations',
    },
];

export default function InventoryDonationsPage({ donations }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const filteredDonations = useMemo(() => {
        return donations.filter((donation) => {
            const matchesSearch =
                donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                donation.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                donation.items.some((item) => item.item_name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
            const matchesType = typeFilter === 'all' || donation.donation_type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [donations, searchTerm, statusFilter, typeFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    const getTotalValue = () => {
        return donations.filter((d) => d.donation_type === 'money' && d.status === 'received').reduce((sum, d) => sum + (d.amount || 0), 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Donation Management" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Donation Management</h1>
                    <p className="text-gray-600">Track and manage all donations and donated items</p>
                </div>

                {/* Statistics Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                                    <p className="text-2xl font-bold text-blue-600">{donations.length}</p>
                                </div>
                                <Gift className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cash Received</p>
                                    <p className="text-2xl font-bold text-green-600">MWK {getTotalValue().toLocaleString()}</p>
                                </div>
                                <Gift className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DonationsTable donations={filteredDonations.filter((d) => d.donation_type === 'money')} />
            </div>
        </AppLayout>
    );
}

function DonationsTable({ donations }: { donations: Donation[] }) {
    const [loadingInventory, setLoadingInventory] = useState<number | null>(null);
    const [successfullyAdded, setSuccessfullyAdded] = useState<number[]>([]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    const handleAddToInventory = async (donationId: number, donationItems: any[]) => {
        // Show confirmation dialog with item details
        const itemsList = donationItems.map((item) => `• ${item.quantity}× ${item.item_name}`).join('\n');
        const confirmed = window.confirm(
            `Are you sure you want to add these items to inventory?\n\n${itemsList}\n\nThis action will move the items from donations to the inventory system.`,
        );

        if (!confirmed) {
            return;
        }

        setLoadingInventory(donationId);

        // Show initial loading toast
        const loadingToast = toast.loading('Adding items to inventory...', {
            description: 'Please wait while we process the items.',
        });

        try {
            const response = await fetch(`/inventory/donations/${donationId}/add-to-inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (response.ok) {
                // Show detailed success feedback
                if (data.added_count > 0) {
                    // Add to successfully added list for visual feedback
                    setSuccessfullyAdded((prev) => [...prev, donationId]);

                    toast.success('Items successfully added to inventory!', {
                        description: `${data.added_count} item type(s) have been added to the inventory system.`,
                        duration: 4000,
                    });
                }

                if (data.skipped_count > 0) {
                    toast.info('Some items were already in inventory', {
                        description: `${data.skipped_count} item(s) were already in the inventory system.`,
                        duration: 3000,
                    });
                }

                if (data.added_count === 0 && data.skipped_count === 0) {
                    toast.info('No items were processed', {
                        description: data.message || 'No items were added to inventory.',
                        duration: 3000,
                    });
                }

                // Refresh the page to show updated status with a slight delay
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // Handle different error types
                if (response.status === 400) {
                    toast.error('Invalid request', {
                        description: data.message || 'The donation cannot be added to inventory.',
                        duration: 4000,
                    });
                } else if (response.status === 404) {
                    toast.error('Donation not found', {
                        description: 'The specified donation could not be found.',
                        duration: 4000,
                    });
                } else if (response.status >= 500) {
                    toast.error('Server error', {
                        description: 'A server error occurred. Please try again later.',
                        duration: 4000,
                    });
                } else {
                    toast.error('Failed to add to inventory', {
                        description: data.message || 'An unexpected error occurred.',
                        duration: 4000,
                    });
                }
            }
        } catch (error) {
            // Dismiss loading toast
            toast.dismiss(loadingToast);

            console.error('Failed to add to inventory:', error);

            if (error instanceof TypeError && error.message.includes('fetch')) {
                toast.error('Network error', {
                    description: 'Please check your internet connection and try again.',
                    duration: 4000,
                });
            } else {
                toast.error('Unexpected error', {
                    description: 'An unexpected error occurred. Please try again.',
                    duration: 4000,
                });
            }
        } finally {
            setLoadingInventory(null);
        }
    };

    if (donations.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Gift className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No donations found</h3>
                    <p className="mt-2 text-gray-500">No donations match your current filters.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Donations ({donations.length})</CardTitle>
                <CardDescription>Detailed view of all donations and their items</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Donor</TableHead>
                            <TableHead>Child</TableHead>
                            <TableHead>Amount / Items</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {donations.map((donation) => (
                            <TableRow key={donation.id} className={successfullyAdded.includes(donation.id) ? 'border-green-200 bg-green-50' : ''}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm">{formatDate(donation.created_at)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">
                                                {donation.is_anonymous ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        Anonymous
                                                    </Badge>
                                                ) : (
                                                    donation.donor_name
                                                )}
                                            </span>
                                        </div>
                                        {donation.donor_email && !donation.is_anonymous && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{donation.donor_email}</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {donation.child_name ? (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-500" />
                                            <span className="font-medium text-blue-600">{donation.child_name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">General</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {donation.donation_type === 'money' ? (
                                        <div className="flex items-center gap-2">
                                            <Gift className="h-4 w-4 text-green-500" />
                                            <span className="font-semibold text-green-600">MWK {donation.amount?.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-purple-500" />
                                                <span className="font-medium text-purple-600">{donation.items?.length || 0} item type(s)</span>
                                            </div>
                                            <div className="space-y-1">
                                                {donation.items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">{item.quantity}×</span> {item.item_name}
                                                            {item.estimated_value && (
                                                                <span className="ml-2 text-green-600">
                                                                    (MWK {item.estimated_value.toLocaleString()})
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.in_inventory && (
                                                            <Badge variant="outline" className="text-xs text-green-600">
                                                                In Inventory
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        {donation.donation_type === 'money' ? <Gift className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                                        {donation.donation_type === 'money' ? 'Cash' : 'Items'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(donation.status)}>
                                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {donation.donation_type === 'goods' && donation.status === 'received' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddToInventory(donation.id, donation.items || [])}
                                                disabled={
                                                    loadingInventory === donation.id || (donation.items || []).every((item: any) => item.in_inventory)
                                                }
                                                className={
                                                    (donation.items || []).every((item: any) => item.in_inventory)
                                                        ? 'border-green-200 bg-green-50 text-green-700'
                                                        : ''
                                                }
                                            >
                                                {loadingInventory === donation.id ? (
                                                    <>
                                                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                                        Adding...
                                                    </>
                                                ) : (donation.items || []).every((item: any) => item.in_inventory) ? (
                                                    '✓ Already in Inventory'
                                                ) : (
                                                    `Add ${(donation.items || []).length} Item${(donation.items || []).length !== 1 ? 's' : ''} to Inventory`
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

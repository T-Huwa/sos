import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Gift, Mail, Package, Search, User } from 'lucide-react';
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
        href: '/inventory/dashboard',
    },
    {
        title: 'Donations',
        href: '/inventory/donations',
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

    const getTotalItems = () => {
        return donations
            .filter((d) => d.donation_type === 'goods')
            .reduce((sum, d) => sum + d.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    };

    const getUniqueItemTypes = () => {
        const itemTypes = new Set<string>();
        donations.filter((d) => d.donation_type === 'goods').forEach((d) => d.items.forEach((item) => itemTypes.add(item.item_name)));
        return itemTypes.size;
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

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Items Donated</p>
                                    <p className="text-2xl font-bold text-purple-600">{getTotalItems()}</p>
                                </div>
                                <Package className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Item Types</p>
                                    <p className="text-2xl font-bold text-orange-600">{getUniqueItemTypes()}</p>
                                </div>
                                <Package className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="all" className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList>
                            <TabsTrigger value="all">All Donations</TabsTrigger>
                            <TabsTrigger value="items">Item Donations</TabsTrigger>
                            <TabsTrigger value="cash">Cash Donations</TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search donations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="received">Received</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <TabsContent value="all">
                        <DonationsTable donations={filteredDonations} />
                    </TabsContent>

                    <TabsContent value="items">
                        <DonationsTable donations={filteredDonations.filter((d) => d.donation_type === 'goods')} />
                    </TabsContent>

                    <TabsContent value="cash">
                        <DonationsTable donations={filteredDonations.filter((d) => d.donation_type === 'money')} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function DonationsTable({ donations }: { donations: Donation[] }) {
    const [loadingInventory, setLoadingInventory] = useState<number | null>(null);

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

    const handleAddToInventory = async (donationId: number) => {
        setLoadingInventory(donationId);
        try {
            const response = await fetch(`/inventory/donations/${donationId}/add-to-inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                if (data.added_count > 0) {
                    toast.success(`Successfully added ${data.added_count} item type(s) to inventory!`);
                } else {
                    toast.info(data.message);
                }

                if (data.skipped_count > 0) {
                    toast.info(`${data.skipped_count} item(s) were already in inventory.`);
                }

                // Refresh the page to show updated status
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Failed to add to inventory:', error);
            toast.error('Failed to add items to inventory. Please try again.');
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
                            <TableRow key={donation.id}>
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
                                                {donation.donor_name}
                                                {donation.is_anonymous && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        Anonymous
                                                    </Badge>
                                                )}
                                            </span>
                                        </div>
                                        {donation.donor_email && (
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
                                                <span className="font-medium text-purple-600">{donation.items.length} item type(s)</span>
                                            </div>
                                            <div className="space-y-1">
                                                {donation.items.map((item) => (
                                                    <div key={item.id} className="text-sm text-gray-600">
                                                        <span className="font-medium">{item.quantity}×</span> {item.item_name}
                                                        {item.estimated_value && (
                                                            <span className="ml-2 text-green-600">(MWK {item.estimated_value.toLocaleString()})</span>
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
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                        {donation.donation_type === 'goods' && donation.status === 'received' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddToInventory(donation.id)}
                                                disabled={loadingInventory === donation.id}
                                            >
                                                {loadingInventory === donation.id ? 'Adding...' : 'Add to Inventory'}
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

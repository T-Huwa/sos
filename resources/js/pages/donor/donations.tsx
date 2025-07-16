import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Gift, Loader2, Package, Plus, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DonatedItem {
    id: number;
    item_name: string;
    quantity: number;
    estimated_value?: number;
}

interface Child {
    id: number;
    name: string;
    age: number;
}

interface Donation {
    id: number;
    amount?: number;
    donation_type: 'money' | 'goods';
    status: 'pending' | 'received' | 'failed';
    description?: string;
    created_at: string;
    child?: Child;
    donated_items?: DonatedItem[];
}

interface PaginatedDonations {
    data: Donation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total_donated: number;
    total_donations: number;
    children_helped: number;
    this_month: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/donor/dashboard',
    },
    {
        title: 'My Donations',
        href: '/donor/donations',
    },
];

export default function DonorDonations() {
    const [donations, setDonations] = useState<PaginatedDonations | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        search: '',
    });
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchDonations();
    }, [filters, currentPage]);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                ...filters,
            });

            const response = await fetch(`/donor/donations/api?${params}`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDonations(data.donations);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch donations:', error);
        } finally {
            setLoading(false);
        }
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

    const formatAmount = (amount: number | undefined, type: string) => {
        if (type === 'goods') return 'Items';
        return amount ? `MWK ${amount.toLocaleString()}` : 'N/A';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Donations" />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
                        <p className="text-gray-600">Track your contributions and their impact</p>
                    </div>
                    <Button asChild>
                        <Link href="/donor/donate">
                            <Plus className="mr-2 h-4 w-4" />
                            Make Donation
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Donated</p>
                                        <p className="text-2xl font-bold text-green-600">MWK {stats.total_donated.toLocaleString()}</p>
                                    </div>
                                    <Gift className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Donations</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.total_donations}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Children Helped</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.children_helped}</p>
                                    </div>
                                    <User className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">This Month</p>
                                        <p className="text-2xl font-bold text-orange-600">MWK {stats.this_month.toLocaleString()}</p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search donations..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="received">Received</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="money">Cash</SelectItem>
                                        <SelectItem value="goods">Items</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Donations List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Donation History</CardTitle>
                        <CardDescription>Complete record of your contributions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading donations...</span>
                            </div>
                        ) : donations && donations.data.length > 0 ? (
                            <div className="space-y-4">
                                {donations.data.map((donation) => (
                                    <div key={donation.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                {donation.donation_type === 'money' ? (
                                                    <Gift className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{donation.child ? donation.child.name : 'General Donation'}</p>
                                                <p className="text-sm text-gray-600">
                                                    {donation.donation_type === 'money' ? 'Cash' : 'Items'} • {formatDate(donation.created_at)}
                                                </p>
                                                {donation.description && <p className="mt-1 text-sm text-gray-500">{donation.description}</p>}
                                                {donation.donated_items && donation.donated_items.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-gray-700">Items:</p>
                                                        <ul className="text-sm text-gray-600">
                                                            {donation.donated_items.map((item, index) => (
                                                                <li key={index}>
                                                                    {item.item_name} (Qty: {item.quantity})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatAmount(donation.amount, donation.donation_type)}</p>
                                            <Badge variant={getStatusBadgeVariant(donation.status)}>
                                                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {donations.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <p className="text-sm text-gray-600">
                                            Showing {(donations.current_page - 1) * donations.per_page + 1} to{' '}
                                            {Math.min(donations.current_page * donations.per_page, donations.total)} of {donations.total} donations
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === donations.last_page}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Gift className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Start making a difference by donating to children in need.</p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href="/donor/donate">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Make Your First Donation
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import InventoryItemModal from '@/components/InventoryItemModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, Calendar, CheckCircle, MapPin, Package, Plus, Search, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface InventoryItem {
    id: number;
    item_name: string;
    total_quantity: number;
    category: string;
    location: string;
    donation_count: number;
    first_added: string;
    last_updated: string;
    status: 'Good' | 'Low' | 'Critical';
    threshold: number;
}

interface Statistics {
    total_items: number;
    total_item_types: number;
    critical_items: number;
    low_stock_items: number;
}

interface Props {
    inventoryItems: InventoryItem[];
    statistics: Statistics;
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
];

export default function InventoryPage({ inventoryItems, statistics }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const openModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    const filteredItems = useMemo(() => {
        return inventoryItems.filter((item) => {
            const matchesSearch =
                item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [inventoryItems, searchTerm, statusFilter, categoryFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Good':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Low':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Critical':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Package className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Good':
                return 'default';
            case 'Low':
                return 'secondary';
            case 'Critical':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getUniqueCategories = () => {
        return [...new Set(inventoryItems.map((item) => item.category))];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-600">Monitor stock levels and manage donated items</p>
                    </div>
                    <a href="/inventory/mass-requisition">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Mass Requisition
                        </Button>
                    </a>
                </div>

                {/* Statistics Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                                    <p className="text-2xl font-bold text-blue-600">{statistics.total_items}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Item Types</p>
                                    <p className="text-2xl font-bold text-green-600">{statistics.total_item_types}</p>
                                </div>
                                <Package className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                    <p className="text-2xl font-bold text-yellow-600">{statistics.low_stock_items}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Critical Stock</p>
                                    <p className="text-2xl font-bold text-red-600">{statistics.critical_items}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="all" className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList>
                            <TabsTrigger value="all">All Items</TabsTrigger>
                            <TabsTrigger value="low">Low Stock</TabsTrigger>
                            <TabsTrigger value="critical">Critical</TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search items..."
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
                                <option value="Good">Good</option>
                                <option value="Low">Low Stock</option>
                                <option value="Critical">Critical</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="all">All Categories</option>
                                {getUniqueCategories().map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <TabsContent value="all">
                        <InventoryTable items={filteredItems} onEdit={openModal} />
                    </TabsContent>

                    <TabsContent value="low">
                        <InventoryTable items={filteredItems.filter((item) => item.status === 'Low')} onEdit={openModal} />
                    </TabsContent>

                    <TabsContent value="critical">
                        <InventoryTable items={filteredItems.filter((item) => item.status === 'Critical')} onEdit={openModal} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Inventory Item Modal */}
            <InventoryItemModal item={selectedItem} isOpen={isModalOpen} onClose={closeModal} />
        </AppLayout>
    );
}

function InventoryTable({ items, onEdit }: { items: InventoryItem[]; onEdit: (item: InventoryItem) => void }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Good':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Low':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Critical':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Package className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Good':
                return 'default';
            case 'Low':
                return 'secondary';
            case 'Critical':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    if (items.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
                    <p className="mt-2 text-gray-500">No inventory items match your current filters.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Items ({items.length})</CardTitle>
                <CardDescription>Current stock levels and item details</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Donations</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{item.item_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold">{item.total_quantity}</span>
                                            <span className="text-sm text-gray-500">units</span>
                                        </div>
                                        <Progress value={(item.total_quantity / item.threshold) * 100} className="h-2 w-20" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(item.status)}
                                        <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize">{item.category}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-gray-400" />
                                        <span className="text-sm">{item.location}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <span className="font-medium">{item.donation_count}</span>
                                        <span className="text-gray-500"> donations</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <span className="text-sm">{formatDate(item.last_updated)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                                            Edit
                                        </Button>
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

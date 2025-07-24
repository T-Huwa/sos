'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, Package } from 'lucide-react';

interface DashboardData {
    totalChildren?: number;
    childrenThisMonth?: number;
    activeDonors?: number;
    urgentCases?: number;
    totalInventoryItems?: number;
    totalItemTypes?: number;
    criticalItems?: number;
    lowStockItems?: number;
    recentDonations?: Array<{
        id: number;
        created_at: string;
        donor_name: string;
        child_name: string;
        items_count: number;
        total_quantity: number;
    }>;
}

interface Props {
    dashboardData?: DashboardData;
}

const urgentChildren = [
    {
        id: 1,
        name: 'Mphatso Banda',
        location: 'Blantyre',
        needs: 'Medical Care',
        urgency: 'Critical',
        lastDonation: '2 weeks ago',
    },
    {
        id: 2,
        name: 'Grace Kachingwe',
        location: 'Kasungu',
        needs: 'School Fees',
        urgency: 'Critical',
        lastDonation: '3 weeks ago',
    },
    {
        id: 3,
        name: 'Kondwani Tembo',
        location: 'Zomba',
        needs: 'Clothing',
        urgency: 'High',
        lastDonation: '1 week ago',
    },
];

const recentDonations = [
    {
        id: 1,
        donor: 'John Banda',
        child: 'Chisomo Phiri',
        amount: 'MWK 15,000',
        type: 'Money',
        date: '2024-01-15',
    },
    {
        id: 2,
        donor: 'Mary Mwale',
        child: 'Thandiwe Mwale',
        amount: 'School Supplies',
        type: 'Items',
        date: '2024-01-14',
    },
    {
        id: 3,
        donor: 'Peter Nyirenda',
        child: 'Patrick Nyirenda',
        amount: 'MWK 8,000',
        type: 'Money',
        date: '2024-01-13',
    },
];

const inventoryAlerts = [
    { item: 'School Uniforms', stock: 12, threshold: 20, status: 'Low' },
    { item: 'Exercise Books', stock: 5, threshold: 50, status: 'Critical' },
    { item: 'Medical Supplies', stock: 8, threshold: 15, status: 'Low' },
    { item: 'School Shoes', stock: 25, threshold: 30, status: 'Good' },
];

export default function OverviewTab({ dashboardData }: Props) {
    const page = usePage();
    const userRole = (page.props as any).auth?.user?.role;
    const isInventoryManager = userRole === 'inventory_manager';

    // Use real data if available, otherwise fall back to sample data
    const recentDonationsData = dashboardData?.recentDonations || recentDonations;
    const inventoryAlertsData = dashboardData
        ? [
              { item: 'Critical Stock Items', stock: dashboardData.criticalItems || 0, threshold: 5, status: 'Critical' },
              { item: 'Low Stock Items', stock: dashboardData.lowStockItems || 0, threshold: 15, status: 'Low' },
              { item: 'Total Item Types', stock: dashboardData.totalItemTypes || 0, threshold: 100, status: 'Good' },
              { item: 'Total Items in Stock', stock: dashboardData.totalInventoryItems || 0, threshold: 1000, status: 'Good' },
          ]
        : inventoryAlerts;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Children Needing Urgent Attention
                        </CardTitle>
                        <CardDescription>Children who haven't received donations recently</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {urgentChildren.map((child) => (
                                <div key={child.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                                    <div>
                                        <p className="font-medium">{child.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {child.location} • {child.needs}
                                        </p>
                                        <p className="text-xs text-red-600">Last donation: {child.lastDonation}</p>
                                    </div>
                                    <Badge variant="destructive">{child.urgency}</Badge>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-4 w-full" variant="outline">
                            View All Urgent Cases
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Donations</CardTitle>
                        <CardDescription>Latest contributions from donors</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDonationsData.map((donation) => (
                                <div
                                    key={donation.id}
                                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                                >
                                    <div>
                                        <p className="font-medium">{donation.donor_name || donation.donor}</p>
                                        <p className="text-sm text-gray-600">to {donation.child_name || donation.child}</p>
                                        <p className="text-xs text-gray-500">{donation.created_at || donation.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {dashboardData
                                                ? `${donation.items_count || 0} items (${donation.total_quantity || 0} total)`
                                                : isInventoryManager && donation.type === 'Money'
                                                  ? 'Cash Donation'
                                                  : donation.amount}
                                        </p>
                                        <Badge variant="secondary">{donation.type}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventory Alerts
                    </CardTitle>
                    <CardDescription>Items running low in stock</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {inventoryAlertsData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">{item.item}</p>
                                    <p className="text-sm text-gray-600">Current stock: {item.stock} units</p>
                                </div>
                                <Badge variant={item.status === 'Critical' ? 'destructive' : item.status === 'Low' ? 'secondary' : 'default'}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

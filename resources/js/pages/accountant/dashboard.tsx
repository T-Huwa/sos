import OverviewTab from '@/components/overviewTab';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { DollarSign, Gift, Users } from 'lucide-react';

interface DashboardData {
    totalChildren: number;
    childrenThisMonth: number;
    activeDonors: number;
    monthlyDonations: number;
    donationChange: number;
}

interface Props {
    dashboardData: DashboardData;
}

export default function DashboardPage({ dashboardData }: Props) {
    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Children</p>
                                    <p className="text-2xl font-bold text-blue-600">{dashboardData.totalChildren.toLocaleString()}</p>
                                    <p className="text-xs text-green-600">+{dashboardData.childrenThisMonth} this month</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Donors</p>
                                    <p className="text-2xl font-bold text-green-600">{dashboardData.activeDonors.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600">Total unique donors</p>
                                </div>
                                <Gift className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Monthly Donations</p>
                                    <p className="text-2xl font-bold text-purple-600">MWK {dashboardData.monthlyDonations.toLocaleString()}</p>
                                    <p className={`text-xs ${dashboardData.donationChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {dashboardData.donationChange >= 0 ? '+' : ''}
                                        {dashboardData.donationChange}% from last month
                                    </p>
                                </div>
                                {/* <DollarSign className="h-8 w-8 text-purple-600" /> */}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <OverviewTab />
            </div>
        </AppLayout>
    );
}

import OverviewTab from '@/components/overviewTab';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { AlertTriangle, DollarSign, Gift, Users } from 'lucide-react';

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Children</p>
                                    <p className="text-2xl font-bold text-blue-600">2,847</p>
                                    <p className="text-xs text-green-600">+12 this month</p>
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
                                    <p className="text-2xl font-bold text-green-600">1,256</p>
                                    <p className="text-xs text-green-600">+45 this month</p>
                                </div>
                                <Gift className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
{/* 
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Monthly Donations</p>
                                    <p className="text-2xl font-bold text-purple-600">MWK 2.3M</p>
                                    <p className="text-xs text-green-600">+18% from last month</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card> */}

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Urgent Cases</p>
                                    <p className="text-2xl font-bold text-red-600">23</p>
                                    <p className="text-xs text-red-600">Needs immediate attention</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <OverviewTab />
            </div>
        </AppLayout>
    );
}

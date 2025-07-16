import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BarChart3, FileText } from 'lucide-react';

const inventoryAlerts = [
    { item: 'School Uniforms', stock: 12, threshold: 20, status: 'Low' },
    { item: 'Exercise Books', stock: 5, threshold: 50, status: 'Critical' },
    { item: 'Medical Supplies', stock: 8, threshold: 15, status: 'Low' },
    { item: 'School Shoes', stock: 25, threshold: 30, status: 'Good' },
];

export default function ChildrenPage() {
    return (
        <AppLayout>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Generate Reports
                        </CardTitle>
                        <CardDescription>Create detailed reports for analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Monthly Donation Report
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Children Progress Report
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Inventory Usage Report
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Donor Activity Report
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Sponsorship Impact Report
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>Key metrics at a glance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                            <span className="font-medium">Children with sponsors</span>
                            <span className="font-bold text-blue-600">542</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                            <span className="font-medium">Successful deliveries</span>
                            <span className="font-bold text-green-600">98.5%</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                            <span className="font-medium">Average response time</span>
                            <span className="font-bold text-purple-600">2.3 days</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
                            <span className="font-medium">Thank you letters sent</span>
                            <span className="font-bold text-orange-600">1,234</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

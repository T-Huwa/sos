import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';

const inventoryAlerts = [
    { item: 'School Uniforms', stock: 12, threshold: 20, status: 'Low' },
    { item: 'Exercise Books', stock: 5, threshold: 50, status: 'Critical' },
    { item: 'Medical Supplies', stock: 8, threshold: 15, status: 'Low' },
    { item: 'School Shoes', stock: 25, threshold: 30, status: 'Good' },
];

export default function ChildrenPage() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Monitor stock levels and distribution</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {inventoryAlerts.map((item, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-medium">{item.item}</p>
                                        <Badge variant={item.status === 'Critical' ? 'destructive' : item.status === 'Low' ? 'secondary' : 'default'}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <div className="mb-2 flex justify-between text-sm text-gray-600">
                                        <span>Current: {item.stock} units</span>
                                        <span>Threshold: {item.threshold} units</span>
                                    </div>
                                    <Progress value={(item.stock / item.threshold) * 100} className="h-2" />
                                </div>
                                <div className="ml-4">
                                    <Button size="sm" variant="outline">
                                        Restock
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

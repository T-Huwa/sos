import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Mail } from 'lucide-react';

export default function ChildrenPage() {
    return (
        <AppLayout>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Send Thank You Letters
                        </CardTitle>
                        <CardDescription>Manage donor communications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full">Send Bulk Thank You Letters</Button>
                        <Button className="w-full" variant="outline">
                            Create Custom Letter Template
                        </Button>
                        <Button className="w-full" variant="outline">
                            View Sent Letters
                        </Button>
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-sm text-yellow-800">
                                <strong>Pending:</strong> 23 thank you letters need to be sent
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Communications</CardTitle>
                        <CardDescription>Latest messages and updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="rounded-lg border p-3">
                                <div className="mb-1 flex items-start justify-between">
                                    <p className="text-sm font-medium">Thank you letter sent</p>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                </div>
                                <p className="text-sm text-gray-600">To John Banda for donation to Chisomo Phiri</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="mb-1 flex items-start justify-between">
                                    <p className="text-sm font-medium">Progress update sent</p>
                                    <span className="text-xs text-gray-500">1 day ago</span>
                                </div>
                                <p className="text-sm text-gray-600">Academic report for sponsored children</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="mb-1 flex items-start justify-between">
                                    <p className="text-sm font-medium">Newsletter sent</p>
                                    <span className="text-xs text-gray-500">3 days ago</span>
                                </div>
                                <p className="text-sm text-gray-600">Monthly update to all donors</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

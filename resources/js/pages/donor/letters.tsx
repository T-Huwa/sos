import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />
            <Card>
                <CardHeader>
                    <CardTitle>Thank You Letters</CardTitle>
                    <CardDescription>Messages from the children you've helped</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium">From Chisomo Phiri</p>
                                <span className="text-sm text-gray-600">Jan 16, 2024</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                "Zikomo kwambiri for the school supplies! I can now write properly in my exercise books. My teacher says my
                                handwriting is getting better. Thank you for helping me with my education."
                            </p>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium">From Mphatso Banda</p>
                                <span className="text-sm text-gray-600">Jan 12, 2024</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                "Thank you so much for the uniform! I feel proud to wear it to school. All my friends think it looks very nice. God
                                bless you!"
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

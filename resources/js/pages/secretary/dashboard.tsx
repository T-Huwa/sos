import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, FileText, UserPlus, Users } from 'lucide-react';

export default function SecretaryDashboard() {
    return (
        <AppLayout>
            <Head title="Secretary Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to Secretary Dashboard</h1>
                                <p className="text-gray-600 dark:text-gray-400">Manage children records and information in the system</p>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">View Children</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">All Children</div>
                                        <p className="text-xs text-muted-foreground">View and manage all children in the system</p>
                                        <Link href={route('secretary.children')}>
                                            <Button className="mt-2 w-full" size="sm">
                                                View Children
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Add New Child</CardTitle>
                                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Register</div>
                                        <p className="text-xs text-muted-foreground">Add a new child to the system</p>
                                        <Link href={route('secretary.children')}>
                                            <Button className="mt-2 w-full" size="sm" variant="outline">
                                                Add Child
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                {/* <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Child Records</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Records</div>
                                        <p className="text-xs text-muted-foreground">Manage child documentation</p>
                                        <Button className="mt-2 w-full" size="sm" variant="outline" disabled>
                                            Coming Soon
                                        </Button>
                                    </CardContent>
                                </Card> */}

                                {/* <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Reports</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Analytics</div>
                                        <p className="text-xs text-muted-foreground">View children statistics</p>
                                        <Button className="mt-2 w-full" size="sm" variant="outline" disabled>
                                            Coming Soon
                                        </Button>
                                    </CardContent>
                                </Card> */}
                            </div>

                            {/* Recent Activity */}
                            {/* <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest updates and activities in the children management system</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">System initialized</p>
                                                <p className="text-xs text-muted-foreground">Secretary dashboard is ready for use</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card> */}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

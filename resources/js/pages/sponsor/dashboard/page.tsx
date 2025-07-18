'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import { Gift, Heart, TrendingUp, Users } from 'lucide-react';

export default function DonorDashboard() {
    const recentDonations = [
        { id: 1, child: 'Chisomo Phiri', amount: 'MWK 15,000', date: '2024-01-15', type: 'Money', status: 'Delivered' },
        {
            id: 2,
            child: 'Mphatso Banda',
            amount: 'School Supplies',
            date: '2024-01-10',
            type: 'Items',
            status: 'In Transit',
        },
        { id: 3, child: 'Thandiwe Mwale', amount: 'MWK 8,000', date: '2024-01-05', type: 'Money', status: 'Delivered' },
    ];

    const sponsoredChildren = [
        { id: 1, name: 'Chisomo Phiri', age: 12, school: 'Lilongwe Primary', progress: 85 },
        { id: 2, name: 'Mphatso Banda', age: 10, school: 'Blantyre Community School', progress: 92 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Donor Dashboard</h1>
                    <p className="text-gray-600">Track your donations and see the impact you're making</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Donated</p>
                                    <p className="text-2xl font-bold text-green-600">MWK 45,000</p>
                                </div>
                                <Gift className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card> */}

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Children Helped</p>
                                    <p className="text-2xl font-bold text-blue-600">8</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-purple-600">MWK 12,000</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thank You Letters</p>
                                    <p className="text-2xl font-bold text-orange-600">5</p>
                                </div>
                                <Heart className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="donations">Donation History</TabsTrigger>
                        <TabsTrigger value="children">My Children</TabsTrigger>
                        <TabsTrigger value="letters">Thank You Letters</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Donations</CardTitle>
                                    <CardDescription>Your latest contributions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentDonations.map((donation) => (
                                            <div key={donation.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div>
                                                    <p className="font-medium">{donation.child}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {donation.amount} • {donation.date}
                                                    </p>
                                                </div>
                                                <Badge variant={donation.status === 'Delivered' ? 'default' : 'secondary'}>{donation.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-4 w-full" asChild>
                                        <Link href="/children">Donate to More Children</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Children You're Supporting</CardTitle>
                                    <CardDescription>Track their progress</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {sponsoredChildren.map((child) => (
                                            <div key={child.id} className="rounded-lg bg-gray-50 p-3">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="font-medium">{child.name}</p>
                                                    <Badge>{child.progress}% Progress</Badge>
                                                </div>
                                                <p className="mb-2 text-sm text-gray-600">
                                                    Age {child.age} • {child.school}
                                                </p>
                                                <Progress value={child.progress} className="h-2" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="donations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Donation History</CardTitle>
                                <CardDescription>Complete record of your contributions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentDonations.map((donation) => (
                                        <div key={donation.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                    <Gift className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{donation.child}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {donation.type} • {donation.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{donation.amount}</p>
                                                <Badge variant={donation.status === 'Delivered' ? 'default' : 'secondary'}>{donation.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="children">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {sponsoredChildren.map((child) => (
                                <Card key={child.id}>
                                    <CardHeader>
                                        <CardTitle>{child.name}</CardTitle>
                                        <CardDescription>
                                            Age {child.age} • {child.school}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="mb-2 flex justify-between">
                                                    <span className="text-sm font-medium">Academic Progress</span>
                                                    <span className="text-sm text-gray-600">{child.progress}%</span>
                                                </div>
                                                <Progress value={child.progress} className="h-2" />
                                            </div>
                                            <Button className="w-full" variant="outline" asChild>
                                                <Link href={`/children/${child.id}`}>View Full Profile</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="letters">
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
                                            "Zikomo kwambiri for the school supplies! I can now write properly in my exercise books. My teacher says
                                            my handwriting is getting better. Thank you for helping me with my education."
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="font-medium">From Mphatso Banda</p>
                                            <span className="text-sm text-gray-600">Jan 12, 2024</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            "Thank you so much for the uniform! I feel proud to wear it to school. All my friends think it looks very
                                            nice. God bless you!"
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

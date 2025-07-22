import CreateChildModal from '@/components/CreateChildModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Children Management',
        href: '/secretary/children',
    },
];

interface Child {
    id: number;
    first_name: string;
    last_name: string;
    name?: string;
    age?: number;
    date_of_birth?: string;
    gender?: string;
    location?: string;
    school?: string;
    grade?: string;
    health_status?: string;
    education_level?: string;
    created_at?: string;
}

interface Props {
    children: Child[];
}

export default function SecretaryChildren({ children }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChildren = children.filter(
        (child) =>
            `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.school?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="secondary">Unknown</Badge>;

        switch (status.toLowerCase()) {
            case 'excellent':
                return (
                    <Badge variant="default" className="bg-green-500">
                        Excellent
                    </Badge>
                );
            case 'good':
                return (
                    <Badge variant="default" className="bg-blue-500">
                        Good
                    </Badge>
                );
            case 'fair':
                return <Badge variant="secondary">Fair</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const calculateAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return 'Unknown';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Children Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Children Management</CardTitle>
                                    <CardDescription>View, manage, and add children to the system</CardDescription>
                                </div>
                                <CreateChildModal submitUrl={route('secretary.children.store')} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filters */}
                            <div className="mb-6 flex items-center space-x-4">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search children by name, location, or school..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button variant="outline">Export Data</Button>
                            </div>

                            {/* Statistics */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold">{children.length}</div>
                                        <p className="text-xs text-muted-foreground">Total Children</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold">{children.filter((c) => c.gender === 'male').length}</div>
                                        <p className="text-xs text-muted-foreground">Male</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold">{children.filter((c) => c.gender === 'female').length}</div>
                                        <p className="text-xs text-muted-foreground">Female</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-2xl font-bold">
                                            {
                                                children.filter(
                                                    (c) =>
                                                        c.health_status?.toLowerCase() === 'good' || c.health_status?.toLowerCase() === 'excellent',
                                                ).length
                                            }
                                        </div>
                                        <p className="text-xs text-muted-foreground">Healthy</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Children Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Gender</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>School</TableHead>
                                            <TableHead>Health Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredChildren.length > 0 ? (
                                            filteredChildren.map((child) => (
                                                <TableRow key={child.id}>
                                                    <TableCell className="font-medium">
                                                        {child.first_name} {child.last_name}
                                                    </TableCell>
                                                    <TableCell>{child.age || calculateAge(child.date_of_birth)}</TableCell>
                                                    <TableCell className="capitalize">{child.gender || 'Unknown'}</TableCell>
                                                    <TableCell>{child.location || 'Not specified'}</TableCell>
                                                    <TableCell>{child.school || 'Not specified'}</TableCell>
                                                    <TableCell>{getStatusBadge(child.health_status)}</TableCell>
                                                    <TableCell>
                                                        <Link href={route('secretary.children.show', child.id)}>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center">
                                                    {searchTerm ? 'No children found matching your search.' : 'No children in the system yet.'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

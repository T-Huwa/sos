import CreateChildModal from '@/components/CreateChildModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';

export default function ChildrenPage() {
    const { children } = usePage().props as { children: any[] };

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Children Management</CardTitle>
                    <CardDescription>Manage all children in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                        <CreateChildModal />
                        <Button variant="outline">Export Data</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Photo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Date of Birth</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Education</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {children ? (
                                children?.map((child) => (
                                    <TableRow key={child.id}>
                                        <TableCell>
                                            {child.image || child.photo ? (
                                                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                                                    <img
                                                        src={
                                                            child.image?.startsWith('/storage')
                                                                ? child.image
                                                                : child.photo?.startsWith('/storage')
                                                                  ? child.photo
                                                                  : `/storage/children/${child.image || child.photo}`
                                                        }
                                                        alt={`${child.first_name} ${child.last_name}`}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-child.jpg';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                                                    <span className="text-xs text-gray-500">No Photo</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {child.first_name} {child.last_name}
                                        </TableCell>
                                        <TableCell>{child.date_of_birth}</TableCell>
                                        <TableCell>{child.gender}</TableCell>
                                        <TableCell>{child.education_level ?? 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge>{child.health_status || 'Healthy'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`children/${child.id}`}>
                                                <Button size="sm" variant="outline">
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="text-center" colSpan={7}>
                                        No Children in the system yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

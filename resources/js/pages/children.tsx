import CreateChildModal from '@/components/CreateChildModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link, usePage } from '@inertiajs/react';

export default function ChildrenPage() {
    const { children } = usePage().props as { children: any[] };

    return (
        <div className="m-8 p-6">
            <Card>
                <Link href="/">Back To Home</Link>
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
                                    <TableCell className="text-center" colSpan={6}>
                                        No Children in the system yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

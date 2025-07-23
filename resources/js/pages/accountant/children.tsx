import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import { memo } from 'react';

// Helper function to get the appropriate image source
const getChildImageSrc = (child: any) => {
    if (child.image) {
        // Use uploaded image
        return `/storage/${child.image}`;
    }
    // Use gender-based default image
    const defaultImage = child.gender === 'female' ? 'girl.jpg' : 'boy.jpg';
    return `/storage/children/${defaultImage}`;
};

// Memoized child image component to prevent unnecessary re-renders
const ChildImage = memo(({ child }: { child: any }) => {
    const imageSrc = getChildImageSrc(child);

    return (
        <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
            <img
                src={imageSrc}
                alt={`${child.first_name} ${child.last_name}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                    // Fallback to initials if even default images fail
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                        parent.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600 text-xs font-medium">${child.first_name?.[0] || '?'}${child.last_name?.[0] || ''}</div>`;
                    }
                }}
            />
        </div>
    );
});

ChildImage.displayName = 'ChildImage';

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
                                            <ChildImage child={child} />
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

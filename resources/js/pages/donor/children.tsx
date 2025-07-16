import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Heart, MapPin, User } from 'lucide-react';

interface Child {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    location?: string;
    school?: string;
    grade?: string;
    story?: string;
    image?: string;
    photo?: string;
    health_status?: string;
    academic_performance?: number;
    total_donations?: number;
    donation_count?: number;
}

interface Props {
    children: {
        data: Child[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/donor/dashboard',
    },
    {
        title: 'Children',
        href: '/donor/children',
    },
];

export default function DonorChildren({ children }: Props) {
    const getHealthStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'fair':
                return 'bg-yellow-100 text-yellow-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Children" />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Children in Need</h1>
                    <p className="text-gray-600">Support these children through donations and sponsorship</p>
                </div>

                {/* Children Grid */}
                {children.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {children.data.map((child) => (
                                <Card key={child.id} className="transition-shadow hover:shadow-lg">
                                    <CardHeader className="pb-3">
                                        {/* Child Image */}
                                        {(child.image || child.photo) && (
                                            <div className="mb-4 h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={
                                                        child.image?.startsWith('/storage')
                                                            ? child.image
                                                            : child.photo?.startsWith('/storage')
                                                              ? child.photo
                                                              : `/storage/children/${child.image || child.photo}`
                                                    }
                                                    alt={child.name || `${child.first_name} ${child.last_name}`}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholder-child.jpg';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{child.name || `${child.first_name} ${child.last_name}`}</CardTitle>
                                            {child.health_status && (
                                                <Badge className={getHealthStatusColor(child.health_status)} variant="secondary">
                                                    {child.health_status}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            Age {child.age} • {child.gender}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {child.location && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{child.location}</span>
                                                </div>
                                            )}

                                            {child.school && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <GraduationCap className="h-4 w-4" />
                                                    <span>{child.school}</span>
                                                    {child.grade && <span>• {child.grade}</span>}
                                                </div>
                                            )}

                                            {child.academic_performance && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">Academic Progress</span>
                                                        <span className="text-gray-600">{child.academic_performance}%</span>
                                                    </div>
                                                    <Progress value={child.academic_performance} className="h-2" />
                                                </div>
                                            )}

                                            {(child.total_donations || child.donation_count) && (
                                                <div className="rounded-lg bg-green-50 p-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Heart className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-green-900">
                                                            {child.donation_count || 0} donation{(child.donation_count || 0) !== 1 ? 's' : ''}{' '}
                                                            received
                                                        </span>
                                                    </div>
                                                    {child.total_donations && child.total_donations > 0 && (
                                                        <p className="mt-1 text-sm text-green-700">
                                                            Total: MWK {child.total_donations.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <Button className="flex-1" variant="outline" asChild>
                                                    <Link href={`/donor/children/${child.id}`}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        View Profile
                                                    </Link>
                                                </Button>
                                                <Button className="flex-1" asChild>
                                                    <Link href={`/donor/donate?child_id=${child.id}`}>
                                                        <Heart className="mr-2 h-4 w-4" />
                                                        Donate
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {children.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {(children.current_page - 1) * children.per_page + 1} to{' '}
                                    {Math.min(children.current_page * children.per_page, children.total)} of {children.total} children
                                </p>
                                <div className="flex gap-2">
                                    {children.current_page > 1 && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/donor/children?page=${children.current_page - 1}`}>Previous</Link>
                                        </Button>
                                    )}
                                    {children.current_page < children.last_page && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/donor/children?page=${children.current_page + 1}`}>Next</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No children found</h3>
                        <p className="mt-1 text-sm text-gray-500">There are currently no children in the system.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

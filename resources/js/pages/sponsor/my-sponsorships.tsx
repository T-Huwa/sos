import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Calendar, 
    GraduationCap, 
    Heart, 
    MapPin, 
    TrendingUp,
    BookOpen,
    Stethoscope,
    Award,
    Plus,
    Activity
} from 'lucide-react';

interface Child {
    id: number;
    name: string;
    age: number;
    gender: string;
    location: string;
    school?: string;
    grade?: string;
    story?: string;
    academic_performance?: number;
    health_status?: string;
    last_health_checkup?: string;
    favorite_subjects?: string;
    dreams?: string;
}

interface Sponsorship {
    id: number;
    start_date: string;
    active: boolean;
    child: Child;
}

interface Stats {
    total_sponsored: number;
    total_contributed: number;
    sponsorship_duration: number;
}

interface Props {
    sponsorships: Sponsorship[];
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/sponsor/dashboard',
    },
    {
        title: 'My Sponsorships',
        href: '/sponsor/my-sponsorships',
    },
];

export default function MySponsorship({ sponsorships, stats }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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

    const calculateSponsorshipDuration = (startDate: string) => {
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        
        if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''} ${days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''}`;
        }
        return `${days} day${days > 1 ? 's' : ''}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Sponsorships" />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Sponsorships</h1>
                        <p className="text-gray-600">Monitor the progress of children you're sponsoring</p>
                    </div>
                    <Button asChild>
                        <Link href="/sponsor/children">
                            <Plus className="mr-2 h-4 w-4" />
                            Sponsor More Children
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Children Sponsored</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.total_sponsored}</p>
                                </div>
                                <Heart className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Contributed</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        MWK {stats.total_contributed.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sponsorship Duration</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.sponsorship_duration} months
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sponsored Children */}
                {sponsorships.length > 0 ? (
                    <div className="space-y-6">
                        {sponsorships.map((sponsorship) => (
                            <Card key={sponsorship.id} className="overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{sponsorship.child.name}</CardTitle>
                                            <CardDescription>
                                                Age {sponsorship.child.age} • {sponsorship.child.gender} • {sponsorship.child.location}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                <Heart className="mr-1 h-3 w-3" />
                                                Sponsored
                                            </Badge>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Since {formatDate(sponsorship.start_date)}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Child Information */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">Location:</span>
                                                        <span>{sponsorship.child.location}</span>
                                                    </div>
                                                    
                                                    {sponsorship.child.school && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <GraduationCap className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium">School:</span>
                                                            <span>{sponsorship.child.school}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {sponsorship.child.grade && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <BookOpen className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium">Grade:</span>
                                                            <span>{sponsorship.child.grade}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {sponsorship.child.health_status && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Stethoscope className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium">Health:</span>
                                                            <Badge className={getHealthStatusColor(sponsorship.child.health_status)} variant="secondary">
                                                                {sponsorship.child.health_status}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">Sponsoring for:</span>
                                                        <span>{calculateSponsorshipDuration(sponsorship.start_date)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Academic Progress */}
                                            {sponsorship.child.academic_performance && (
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium flex items-center gap-2">
                                                            <Activity className="h-4 w-4 text-blue-600" />
                                                            Academic Performance
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {sponsorship.child.academic_performance}%
                                                        </span>
                                                    </div>
                                                    <Progress value={sponsorship.child.academic_performance} className="h-2" />
                                                </div>
                                            )}

                                            {/* Additional Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {sponsorship.child.favorite_subjects && (
                                                    <div className="bg-purple-50 p-3 rounded-lg">
                                                        <h4 className="font-medium text-purple-900 mb-1 flex items-center gap-2">
                                                            <Award className="h-4 w-4" />
                                                            Favorite Subjects
                                                        </h4>
                                                        <p className="text-sm text-purple-800">{sponsorship.child.favorite_subjects}</p>
                                                    </div>
                                                )}
                                                
                                                {sponsorship.child.dreams && (
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <h4 className="font-medium text-green-900 mb-1 flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4" />
                                                            Dreams & Goals
                                                        </h4>
                                                        <p className="text-sm text-green-800">{sponsorship.child.dreams}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <Button className="w-full" asChild>
                                                <Link href={`/sponsor/children/${sponsorship.child.id}`}>
                                                    View Full Profile
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href="/donor/donate">
                                                    Make a Donation
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Heart className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sponsorships yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Start making a difference by sponsoring a child in need.
                        </p>
                        <div className="mt-6">
                            <Button asChild>
                                <Link href="/sponsor/children">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Find Children to Sponsor
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

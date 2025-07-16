import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, ArrowLeft, Award, BookOpen, Calendar, GraduationCap, Heart, MapPin, Stethoscope, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Child {
    id: number;
    name: string;
    age: number;
    gender: string;
    location: string;
    school?: string;
    grade?: string;
    story?: string;
    photo?: string;
    date_of_birth?: string;
    guardian_name?: string;
    guardian_contact?: string;
    medical_conditions?: string;
    academic_performance?: number;
    health_status?: string;
    last_health_checkup?: string;
    favorite_subjects?: string;
    hobbies?: string;
    dreams?: string;
    sponsorships?: any[];
}

interface Sponsorship {
    id: number;
    start_date: string;
    active: boolean;
    sponsor: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    child: Child;
    isSponsoring: boolean;
    isAvailable: boolean;
    currentSponsor?: {
        id: number;
        name: string;
        email: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/sponsor/dashboard',
    },
    {
        title: 'Browse Children',
        href: '/sponsor/children',
    },
    {
        title: 'Child Profile',
        href: '#',
    },
];

export default function SponsorChildProfile({ child, isSponsoring, isAvailable, currentSponsor }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSponsor = async () => {
        if (isSponsoring) {
            toast.info('You are already sponsoring this child.');
            return;
        }

        if (!isAvailable) {
            toast.error('This child is already being sponsored by someone else.');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to sponsor ${child.name}? This is a commitment to support their education and wellbeing.`,
        );

        if (!confirmed) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/sponsor/children/${child.id}/sponsor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success(`You are now sponsoring ${child.name}! Thank you for making a difference.`);
                router.visit('/sponsor/my-sponsorships');
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to create sponsorship. Please try again.');
            }
        } catch (error) {
            console.error('Sponsorship error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${child.name} - Child Profile`} />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/sponsor/children">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Children
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
                            <p className="text-gray-600">
                                Age {child.age} • {child.gender} • {child.location}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isSponsoring && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Heart className="mr-1 h-3 w-3" />
                                You are sponsoring this child
                            </Badge>
                        )}

                        {!isSponsoring && isAvailable && (
                            <Button onClick={handleSponsor} disabled={isLoading} size="lg">
                                {isLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Heart className="mr-2 h-4 w-4" />
                                        Sponsor {child.name}
                                    </>
                                )}
                            </Button>
                        )}

                        {!isSponsoring && !isAvailable && currentSponsor && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Sponsored by {currentSponsor.name}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column - Child Information */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    About {child.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">Date of Birth:</span>
                                            <span>{child.date_of_birth ? formatDate(child.date_of_birth) : 'Not available'}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">Location:</span>
                                            <span>{child.location}</span>
                                        </div>

                                        {child.school && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <GraduationCap className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">School:</span>
                                                <span>{child.school}</span>
                                                {child.grade && <span>• {child.grade}</span>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {child.guardian_name && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">Guardian:</span>
                                                <span>{child.guardian_name}</span>
                                            </div>
                                        )}

                                        {child.guardian_contact && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium">Contact:</span>
                                                <span>{child.guardian_contact}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {child.story && (
                                    <div className="mt-6">
                                        <h4 className="mb-2 font-medium text-gray-900">{child.name}'s Story</h4>
                                        <p className="leading-relaxed text-gray-700">{child.story}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress Monitoring Tabs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Progress Monitoring
                                </CardTitle>
                                <CardDescription>Track {child.name}'s academic and health progress over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="academic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="academic">Academic Progress</TabsTrigger>
                                        <TabsTrigger value="health">Health Status</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="academic" className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-sm font-medium">Overall Performance</span>
                                                        <span className="text-sm text-gray-600">{child.academic_performance || 0}%</span>
                                                    </div>
                                                    <Progress value={child.academic_performance || 0} className="h-2" />
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium">Current Grade</span>
                                                    </div>
                                                    <p className="text-lg font-semibold">{child.grade || 'Not specified'}</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {child.favorite_subjects && (
                                            <div className="rounded-lg bg-blue-50 p-4">
                                                <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                                                    <Award className="h-4 w-4" />
                                                    Favorite Subjects
                                                </h4>
                                                <p className="text-blue-800">{child.favorite_subjects}</p>
                                            </div>
                                        )}

                                        {child.dreams && (
                                            <div className="rounded-lg bg-purple-50 p-4">
                                                <h4 className="mb-2 flex items-center gap-2 font-medium text-purple-900">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Dreams & Aspirations
                                                </h4>
                                                <p className="text-purple-800">{child.dreams}</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="health" className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Stethoscope className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm font-medium">Health Status</span>
                                                    </div>
                                                    <Badge className={getHealthStatusColor(child.health_status || 'Unknown')}>
                                                        {child.health_status || 'Unknown'}
                                                    </Badge>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium">Last Checkup</span>
                                                    </div>
                                                    <p className="text-sm">
                                                        {child.last_health_checkup ? formatDate(child.last_health_checkup) : 'No recent checkup'}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {child.medical_conditions && (
                                            <div className="rounded-lg bg-yellow-50 p-4">
                                                <h4 className="mb-2 font-medium text-yellow-900">Medical Conditions</h4>
                                                <p className="text-yellow-800">{child.medical_conditions}</p>
                                            </div>
                                        )}

                                        {child.hobbies && (
                                            <div className="rounded-lg bg-green-50 p-4">
                                                <h4 className="mb-2 font-medium text-green-900">Hobbies & Interests</h4>
                                                <p className="text-green-800">{child.hobbies}</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sponsorship Info */}
                    <div className="space-y-6">
                        {/* Sponsorship Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Sponsorship Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isSponsoring ? (
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-green-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-green-600" />
                                                <span className="font-medium text-green-900">You are sponsoring {child.name}</span>
                                            </div>
                                            <p className="text-sm text-green-700">Thank you for making a difference in {child.name}'s life!</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Button className="w-full" asChild>
                                                <Link href="/sponsor/my-sponsorships">View My Sponsorships</Link>
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href="/donor/donate">Make a Donation</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : isAvailable ? (
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-blue-900">{child.name} needs a sponsor</span>
                                            </div>
                                            <p className="text-sm text-blue-700">Your sponsorship can provide education, healthcare, and hope.</p>
                                        </div>

                                        <Button onClick={handleSponsor} disabled={isLoading} className="w-full" size="lg">
                                            {isLoading ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Heart className="mr-2 h-4 w-4" />
                                                    Sponsor {child.name}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-gray-600" />
                                                <span className="font-medium text-gray-900">Already Sponsored</span>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                {child.name} is currently being sponsored by {currentSponsor?.name}.
                                            </p>
                                        </div>

                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href="/sponsor/children">Find Other Children</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Age</span>
                                        <span className="font-medium">{child.age} years</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Gender</span>
                                        <span className="font-medium">{child.gender}</span>
                                    </div>

                                    {child.school && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">School</span>
                                            <span className="text-right text-sm font-medium">{child.school}</span>
                                        </div>
                                    )}

                                    {child.grade && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Grade</span>
                                            <span className="font-medium">{child.grade}</span>
                                        </div>
                                    )}

                                    {child.academic_performance && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Academic Performance</span>
                                            <span className="font-medium">{child.academic_performance}%</span>
                                        </div>
                                    )}

                                    {child.health_status && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Health Status</span>
                                            <Badge className={getHealthStatusColor(child.health_status)} variant="secondary">
                                                {child.health_status}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Call to Action */}
                        {!isSponsoring && isAvailable && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="p-6">
                                    <div className="space-y-4 text-center">
                                        <Heart className="mx-auto h-8 w-8 text-blue-600" />
                                        <div>
                                            <h3 className="font-semibold text-blue-900">Change {child.name}'s Life</h3>
                                            <p className="mt-1 text-sm text-blue-700">
                                                Your sponsorship provides education, healthcare, and hope for the future.
                                            </p>
                                        </div>
                                        <Button onClick={handleSponsor} disabled={isLoading} className="w-full">
                                            {isLoading ? 'Processing...' : `Sponsor ${child.name}`}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, GraduationCap, Heart, MapPin, Search, Star, User } from 'lucide-react';
import { useState } from 'react';

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
    image?: string;
    sponsorships?: any[];
}

interface Sponsorship {
    id: number;
    child: Child;
    start_date: string;
    active: boolean;
}

interface Props {
    children: {
        data: Child[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    mySponsorship: Sponsorship[];
    filters: {
        locations: string[];
        ageRange: { min: number; max: number };
        current: {
            age_min?: number;
            age_max?: number;
            gender?: string;
            location?: string;
            search?: string;
        };
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
];

// Helper function to get the appropriate image source
const getChildImageSrc = (child: Child) => {
    if (child.image || child.photo) {
        // Use uploaded image (prioritize image field, fallback to photo)
        return `/storage/${child.image || child.photo}`;
    }
    // Use gender-based default image
    const defaultImage = child.gender === 'female' ? 'girl.jpg' : 'boy.jpg';
    return `/storage/children/${defaultImage}`;
};

export default function SponsorChildren({ children, mySponsorship, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.current.search || '');
    const [ageMin, setAgeMin] = useState(filters.current.age_min?.toString() || '');
    const [ageMax, setAgeMax] = useState(filters.current.age_max?.toString() || '');
    const [gender, setGender] = useState(filters.current.gender || 'all');
    const [location, setLocation] = useState(filters.current.location || 'all');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (ageMin) params.append('age_min', ageMin);
        if (ageMax) params.append('age_max', ageMax);
        if (gender !== 'all') params.append('gender', gender);
        if (location !== 'all') params.append('location', location);

        const queryString = params.toString();
        window.location.href = `/sponsor/children${queryString ? '?' + queryString : ''}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setAgeMin('');
        setAgeMax('');
        setGender('all');
        setLocation('all');
        window.location.href = '/sponsor/children';
    };

    const isSponsoring = (childId: number) => {
        return mySponsorship.some((s) => s.child.id === childId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Browse Children" />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Browse Children</h1>
                    <p className="text-gray-600">Find a child to sponsor and make a lasting impact on their life</p>
                </div>

                {/* My Current Sponsorships */}
                {mySponsorship.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Star className="h-5 w-5 text-yellow-500" />
                            My Sponsored Children ({mySponsorship.length})
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {mySponsorship.map((sponsorship) => (
                                <Card key={sponsorship.id} className="border-yellow-200 bg-yellow-50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{sponsorship.child.name}</CardTitle>
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                Sponsored
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Age {sponsorship.child.age} • {sponsorship.child.gender}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{sponsorship.child.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>Since {new Date(sponsorship.start_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Button className="mt-4 w-full" variant="outline" asChild>
                                            <Link href={`/sponsor/children/${sponsorship.child.id}`}>View Profile</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Find Children to Sponsor</CardTitle>
                        <CardDescription>Use filters to find children who need your support</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, story, or school..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div>
                                <Input
                                    type="number"
                                    placeholder="Min Age"
                                    value={ageMin}
                                    onChange={(e) => setAgeMin(e.target.value)}
                                    min={filters.ageRange.min}
                                    max={filters.ageRange.max}
                                />
                            </div>

                            <div>
                                <Input
                                    type="number"
                                    placeholder="Max Age"
                                    value={ageMax}
                                    onChange={(e) => setAgeMax(e.target.value)}
                                    min={filters.ageRange.min}
                                    max={filters.ageRange.max}
                                />
                            </div>

                            <div>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Genders</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Locations</SelectItem>
                                        {filters.locations.map((loc) => (
                                            <SelectItem key={loc} value={loc}>
                                                {loc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Children */}
                <div className="mb-8">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Heart className="h-5 w-5 text-red-500" />
                        Children Available for Sponsorship ({children.total})
                    </h2>

                    {children.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {children.data.map((child) => (
                                    <Card key={child.id} className="transition-shadow hover:shadow-lg">
                                        <CardHeader className="pb-3">
                                            {/* Child Image */}
                                            <div className="mb-4 h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={getChildImageSrc(child)}
                                                    alt={child.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        // Create a fallback with initials if even default images fail
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const firstName = child.name?.split(' ')[0] || '';
                                                            const lastName = child.name?.split(' ')[1] || '';
                                                            parent.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">${firstName[0] || '?'}${lastName[0] || ''}</div>`;
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{child.name}</CardTitle>
                                                {isSponsoring(child.id) && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                        Your Child
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription>
                                                Age {child.age} • {child.gender}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{child.location}</span>
                                                </div>

                                                {child.school && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <GraduationCap className="h-4 w-4" />
                                                        <span>{child.school}</span>
                                                        {child.grade && <span>• {child.grade}</span>}
                                                    </div>
                                                )}

                                                {child.story && (
                                                    <p className="line-clamp-3 text-sm text-gray-700">
                                                        {child.story.length > 100 ? `${child.story.substring(0, 100)}...` : child.story}
                                                    </p>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                    <Button className="flex-1" variant="outline" asChild>
                                                        <Link href={`/sponsor/children/${child.id}`}>View Profile</Link>
                                                    </Button>

                                                    {!isSponsoring(child.id) && (
                                                        <Button className="flex-1" asChild>
                                                            <Link href={`/sponsor/children/${child.id}`}>
                                                                <Heart className="mr-2 h-4 w-4" />
                                                                Sponsor
                                                            </Link>
                                                        </Button>
                                                    )}
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
                                                <Link href={`/sponsor/children?page=${children.current_page - 1}`}>Previous</Link>
                                            </Button>
                                        )}
                                        {children.current_page < children.last_page && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/sponsor/children?page=${children.current_page + 1}`}>Next</Link>
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
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or clear the filters.</p>
                            <div className="mt-6">
                                <Button onClick={clearFilters}>Clear Filters</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { Calendar, Gift, Mail, Package, User } from 'lucide-react';
import { memo, useState } from 'react';

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

// Memoized child profile image component
const ChildProfileImage = memo(({ child }: { child: any }) => {
    const imageSrc = getChildImageSrc(child);

    return (
        <div className="flex justify-center">
            <img
                src={imageSrc}
                alt={`${child.first_name} ${child.last_name}`}
                className="h-48 w-48 rounded-full border-4 border-gray-300 object-cover shadow-md"
                onError={(e) => {
                    // Create a fallback with initials if even default images fail
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                        parent.innerHTML = `<div class="flex h-48 w-48 items-center justify-center rounded-full border-4 border-gray-300 bg-blue-100 text-blue-600 text-4xl font-bold shadow-md">${child.first_name?.[0] || '?'}${child.last_name?.[0] || ''}</div>`;
                    }
                }}
            />
        </div>
    );
});

ChildProfileImage.displayName = 'ChildProfileImage';

export default function ChildViewPage() {
    const { child, donations, donors } = usePage().props as any;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ ...child });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'received':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleUpdate = async () => {
        const data = new FormData();
        Object.entries(form).forEach(([key, val]) => data.append(key, String(val)));

        await fetch(`/inventory/children/${child.id}`, {
            method: 'POST',
            headers: { 'X-HTTP-Method-Override': 'PUT' },
            body: data,
        });

        location.reload();
    };

    const handleDelete = async () => {
        if (confirm('Delete this child?')) {
            await fetch(`inventory/children/${child.id}`, {
                method: 'POST',
                headers: { 'X-HTTP-Method-Override': 'DELETE' },
            });

            location.href = '/inventory/children';
        }
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl space-y-6 rounded-lg bg-white p-6 shadow-md">
                {/* 🖼️ Child Photo */}
                <ChildProfileImage child={child} />
                {/* 🧾 Header & Actions */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Child Profile</h1>
                    {/* <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div> */}
                </div>
                {/* 🧍 Child Info */}
                <div className="space-y-4">
                    {!editing ? (
                        <div className="space-y-2 text-lg text-gray-700">
                            <p>
                                <strong>Name:</strong> {child.first_name} {child.last_name}
                            </p>
                            <p>
                                <strong>Date of Birth:</strong> {child.date_of_birth}
                            </p>
                            <p>
                                <strong>Gender:</strong> {child.gender}
                            </p>
                            <p>
                                <strong>Education:</strong> {child.education_level ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Health Status:</strong> {child.health_status ?? 'Healthy'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input name="first_name" value={form.first_name} onChange={handleChange} />
                            <Input name="last_name" value={form.last_name} onChange={handleChange} />
                            <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
                            <Input name="education_level" value={form.education_level ?? ''} onChange={handleChange} />
                            <Input name="health_status" value={form.health_status ?? ''} onChange={handleChange} />
                            <select name="gender" value={form.gender} onChange={handleChange} className="rounded border px-3 py-2">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="md:col-span-2">
                                <Button className="mt-2" onClick={handleUpdate}>
                                    Update
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                {/* 💰 Donations Section */}
                <div className="border-t pt-6">
                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-800">
                        <Gift className="h-6 w-6" />
                        Donations ({(donations || []).length})
                    </h2>

                    {donations && donations.length ? (
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="all">All Donations</TabsTrigger>
                                {/* <TabsTrigger value="cash">Cash Donations</TabsTrigger> */}
                                <TabsTrigger value="items">Item Donations</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4">
                                {(donations || []).map((donation: any) => (
                                    <Card key={donation.id} className="border-l-4 border-l-blue-500">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        {donation.donation_type === 'money' ? (
                                                            <Gift className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Package className="h-4 w-4 text-purple-500" />
                                                        )}
                                                        <span className="font-medium">
                                                            {donation.donation_type === 'money' ? 'Cash Donation' : 'Item Donation'}
                                                        </span>
                                                        <Badge variant={getStatusBadgeVariant(donation.status)}>
                                                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            <span>
                                                                {donation.donor?.name ||
                                                                    donation.anonymous_name ||
                                                                    donation.guest_name ||
                                                                    'Anonymous'}
                                                            </span>
                                                            {donation.is_anonymous && (
                                                                <Badge variant="outline" className="ml-1 text-xs">
                                                                    Anonymous
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatDate(donation.created_at)}</span>
                                                        </div>
                                                        {(donation.donor?.email || donation.anonymous_email || donation.guest_email) && (
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span>
                                                                    {donation.donor?.email || donation.anonymous_email || donation.guest_email}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {donation.donation_type === 'money' ? (
                                                        <div className="text-lg font-semibold text-green-600">
                                                            MWK {donation.amount?.toLocaleString()}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium text-purple-600">
                                                                {donation?.items?.length} item type(s):
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                {donation?.items?.map((item: any) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="flex items-center justify-between rounded bg-gray-50 p-2"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Package className="h-3 w-3 text-purple-500" />
                                                                            <span className="text-sm font-medium">{item.item_name}</span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Qty: {item.quantity}
                                                                            {item.estimated_value && (
                                                                                <span className="ml-2 text-green-600">
                                                                                    (MWK {item.estimated_value.toLocaleString()})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {donation.description && (
                                                        <div className="mt-2 rounded bg-blue-50 p-2 text-sm">
                                                            <strong>Message:</strong> {donation.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            {/* <TabsContent value="cash" className="space-y-4">
                                {(donations || [])
                                    .filter((d: any) => d.donation_type === 'money')
                                    .map((donation: any) => (
                                        <Card key={donation.id} className="border-l-4 border-l-green-500">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Gift className="h-4 w-4 text-green-500" />
                                                            <span className="font-medium">Cash Donation</span>
                                                            <Badge variant={getStatusBadgeVariant(donation.status)}>
                                                                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            From{' '}
                                                            {donation.donor?.name || donation.anonymous_name || donation.guest_name || 'Anonymous'} on{' '}
                                                            {formatDate(donation.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="text-lg font-semibold text-green-600">
                                                        MWK {donation.amount?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                {(donations || []).filter((d: any) => d.donation_type === 'money').length === 0 && (
                                    <div className="py-8 text-center text-gray-500">No cash donations yet.</div>
                                )}
                            </TabsContent> */}

                            <TabsContent value="items" className="space-y-4">
                                {(donations || [])
                                    .filter((d: any) => d.donation_type === 'goods')
                                    .map((donation: any) => (
                                        <Card key={donation.id} className="border-l-4 border-l-purple-500">
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-purple-500" />
                                                            <span className="font-medium">Item Donation</span>
                                                            <Badge variant={getStatusBadgeVariant(donation.status)}>
                                                                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-gray-600">{formatDate(donation.created_at)}</div>
                                                    </div>

                                                    <div className="text-sm text-gray-600">
                                                        From {donation.donor?.name || donation.anonymous_name || donation.guest_name || 'Anonymous'}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium text-purple-600">
                                                            Items donated ({donation?.items?.length || 0} types):
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {donation?.items?.map((item: any) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex items-center justify-between rounded bg-purple-50 p-3"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Package className="h-4 w-4 text-purple-500" />
                                                                        <span className="font-medium">{item.item_name}</span>
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <span className="font-semibold">Qty: {item.quantity}</span>
                                                                        {item.estimated_value && (
                                                                            <span className="ml-2 text-green-600">
                                                                                (Est. MWK {item.estimated_value.toLocaleString()})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                {(donations || []).filter((d: any) => d.donation_type === 'goods').length === 0 && (
                                    <div className="py-8 text-center text-gray-500">No item donations yet.</div>
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="py-8 text-center">
                            <Gift className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No donations yet</h3>
                            <p className="mt-1 text-gray-500">This child hasn't received any donations yet.</p>
                        </div>
                    )}
                </div>
                {/* 🙋 Donors Section */}
                <div className="border-t pt-6">
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">Donors</h2>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                        {donors && donors.length ? (
                            donors.map((donor: any) => (
                                <li key={donor.id}>
                                    {donor?.name || 'Anonymous'} – {donor.email}
                                </li>
                            ))
                        ) : (
                            <p>No donors yet.</p>
                        )}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}

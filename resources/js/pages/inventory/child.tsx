'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ChildViewPage() {
    const { child, donations, donors } = usePage().props as any;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ ...child });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleUpdate = async () => {
        const data = new FormData();
        Object.entries(form).forEach(([key, val]) => data.append(key, val));

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
                {child.image && (
                    <div className="flex justify-center">
                        <img
                            src={child.image}
                            alt={`${child.first_name} ${child.last_name}`}
                            className="h-48 w-48 rounded-full border-4 border-gray-300 object-cover shadow-md"
                        />
                    </div>
                )}

                {/* 🧾 Header & Actions */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Child Profile</h1>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
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
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">Donations</h2>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                        {donations && donations.length ? (
                            donations.map((d: any) => (
                                <li key={d.id}>
                                    ${d.amount} from {d.donor?.name || 'Anonymous'} on {d.date}
                                </li>
                            ))
                        ) : (
                            <p>No donations yet.</p>
                        )}
                    </ul>
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

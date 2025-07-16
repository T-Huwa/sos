'use client';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ChildViewPage() {
    const { child, donations, donors } = usePage().props as any;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ ...child });

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
                </div>

                {/* 🧍 Child Info */}
                <div className="space-y-4">
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
                </div>

                {/* 💰 Donations Section */}
                <div className="border-t pt-6">
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">Donations</h2>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                        {donations && donations.length ? (
                            donations.map((d: any) => (
                                <li key={d.id}>
                                    ${d.amount} from {d.donor.name} on {d.date}
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
                                    {donor.name} – {donor.email}
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

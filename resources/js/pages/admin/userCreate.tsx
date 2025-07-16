import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function UserCreate() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'admin',
        password: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('admin.dashboard'),
        },
        {
            title: 'Users',
            href: route('admin.users.index'),
        },
        {
            title: 'Create',
            href: route('admin.users.create'),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/users', form);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register User" />
            <Card className="mx-auto mt-10 w-[500px] shadow-lg">
                <CardContent className="space-y-4 p-6">
                    <h2 className="text-xl font-bold">Register New User</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full">
                            Create User
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateChildModalProps {
    submitUrl?: string;
}

export default function CreateChildModal({ submitUrl = '/children' }: CreateChildModalProps) {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        image: null as File | null,
        date_of_birth: '',
        gender: 'male',
        health_status: '',
        education_level: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e: any) => {
        const { name, value, files } = e.target;
        if (files) {
            setForm({ ...form, [name]: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const validateForm = () => {
        if (!form.first_name.trim()) {
            toast.error('First name is required');
            return false;
        }
        if (!form.last_name.trim()) {
            toast.error('Last name is required');
            return false;
        }
        if (!form.image) {
            toast.error('Image is required');
            return false;
        }
        if (!form.date_of_birth) {
            toast.error('Date of birth is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null) {
                    formData.append(key, value as string | Blob);
                }
            });

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            console.log(await response.body)

            if (response.ok) {
                toast.success('Child added successfully!');
                setIsOpen(false);
                // Reset form
                setForm({
                    first_name: '',
                    last_name: '',
                    image: null,
                    date_of_birth: '',
                    gender: 'male',
                    health_status: '',
                    education_level: '',
                });
                // Reload page to show new child
                location.reload();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.log(errorData);
                const errorMessage = errorData.message || 'Failed to add child. Please try again.';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error adding child:', error);
            toast.error('An error occurred while adding the child. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add New Child</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Child</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} disabled={isLoading} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} disabled={isLoading} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth *</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            name="date_of_birth"
                            value={form.date_of_birth}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                            id="gender"
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded border p-2 disabled:opacity-50"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* <div className="space-y-2">
                        <Label htmlFor="health_status">Health Status</Label>
                        <Input
                            id="health_status"
                            name="health_status"
                            value={form.health_status}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="e.g., Healthy, Needs medical attention"
                        />
                    </div> */}

                    <div className="space-y-2">
                        <Label htmlFor="health_status">Health Status</Label>
                        <select
                            id="health_status"
                            name="health_status"
                            value={form.health_status}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded border p-2 disabled:opacity-50"
                        >
                            <option value="healthy">Healthy</option>
                            <option value="good">Good</option>
                            <option value="sick">Sick</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="education_level">Education Level</Label>
                        <Input
                            id="education_level"
                            name="education_level"
                            value={form.education_level}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="e.g., Primary, Secondary"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Photo *</Label>
                        <Input id="image" type="file" name="image" accept="image/*" onChange={handleChange} disabled={isLoading} required />
                        {form.image && <p className="text-sm text-gray-600">Selected: {form.image.name}</p>}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                            {isLoading ? 'Adding...' : 'Add Child'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

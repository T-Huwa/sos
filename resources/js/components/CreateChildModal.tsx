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
        last_location: '',
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

        // Validate image file
        if (form.image) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

            if (form.image.size > maxSize) {
                toast.error('Image file size must be less than 5MB');
                return false;
            }

            if (!allowedTypes.includes(form.image.type)) {
                toast.error('Image must be a JPEG, PNG, or GIF file');
                return false;
            }
        }

        if (!form.date_of_birth) {
            toast.error('Date of birth is required');
            return false;
        }

        // Validate date of birth is not in the future
        const birthDate = new Date(form.date_of_birth);
        const today = new Date();
        if (birthDate > today) {
            toast.error('Date of birth cannot be in the future');
            return false;
        }

        return true;
    };

    const handleSubmit = async (retryCount = 0) => {
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

            // Get CSRF token from meta tag with fallback
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Fallback: try to get from cookie if meta tag is missing
            if (!csrfToken) {
                const cookies = document.cookie.split(';');
                const csrfCookie = cookies.find((cookie) => cookie.trim().startsWith('XSRF-TOKEN='));
                if (csrfCookie) {
                    csrfToken = decodeURIComponent(csrfCookie.split('=')[1]);
                }
            }

            const headers: Record<string, string> = {
                Accept: 'application/json',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(submitUrl, {
                method: 'POST',
                headers,
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

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
                    last_location: '',
                });
                // Reload page to show new child
                location.reload();
            } else {
                // Enhanced error handling
                console.error('Response status:', response.status);
                console.error('Response headers:', response.headers);

                let errorMessage = 'Failed to add child. Please try again.';

                try {
                    const errorData = await response.json();
                    console.error('Error data:', errorData);

                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors) {
                        // Handle validation errors
                        const firstError = Object.values(errorData.errors)[0];
                        if (Array.isArray(firstError)) {
                            errorMessage = firstError[0];
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);

                    // Handle specific HTTP status codes
                    if (response.status === 419) {
                        errorMessage = 'Session expired. Please refresh the page and try again.';
                    } else if (response.status === 422) {
                        errorMessage = 'Validation failed. Please check your input and try again.';
                    } else if (response.status === 500) {
                        errorMessage = 'Server error. Please try again or contact support.';
                    }
                }

                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error adding child:', error);

            // Handle specific error types
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    toast.error('Request timed out. Please try again.');
                } else if (error.message.includes('Failed to fetch') && retryCount < 2) {
                    // Network error - retry up to 2 times
                    console.log(`Retrying request (attempt ${retryCount + 1})`);
                    setTimeout(() => handleSubmit(retryCount + 1), 1000);
                    return;
                } else {
                    toast.error('Network error. Please check your connection and try again.');
                }
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
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
                        <Label htmlFor="last_location">Last Known Location</Label>
                        <Input
                            id="last_location"
                            name="last_location"
                            value={form.last_location}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="e.g., Lilongwe, Blantyre"
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

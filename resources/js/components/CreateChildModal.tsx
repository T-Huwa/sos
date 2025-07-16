'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useState } from 'react';

export default function CreateChildModal() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        image: null,
        date_of_birth: '',
        gender: 'male',
        health_status: '',
        education_level: '',
    });

    const handleChange = (e: any) => {
        const { name, value, files } = e.target;
        if (files) {
            setForm({ ...form, [name]: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value as any));

        await axios.post('/children', formData);
        location.reload();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add New Child</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Child</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input name="first_name" onChange={handleChange} />
                    <Label>Last Name</Label>
                    <Input name="last_name" onChange={handleChange} />
                    <Label>Date of Birth</Label>
                    <Input type="date" name="date_of_birth" onChange={handleChange} />
                    <Label>Gender</Label>
                    <select name="gender" onChange={handleChange} className="w-full rounded border p-2">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <Label>Health Status</Label>
                    <Input name="health_status" onChange={handleChange} />
                    <Label>Education Level</Label>
                    <Input name="education_level" onChange={handleChange} />
                    <Label>Image</Label>
                    <Input type="file" name="image" accept="image/*" onChange={handleChange} />
                    <Button onClick={handleSubmit} className="mt-2">
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

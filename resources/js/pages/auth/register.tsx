import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role: string;
  sponsor_type: string;
  organization_name: string;
};

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    role: 'donor',
    sponsor_type: '',
    organization_name: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    if(data.role === 'admin' || data.role === 'inventory_manager') {
      alert('Invalid role selected. Please choose either Donor or Sponsor.');
      setData('role', '');
      return;
    }
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <AuthLayout title="Create an account" description="Enter your details below to create your account">
      <Head title="Register" />
      <form className="flex flex-col gap-6" onSubmit={submit}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} disabled={processing} required />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} disabled={processing} required />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} disabled={processing} required />
            <InputError message={errors.phone} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={data.role}
              onChange={e => setData('role', e.target.value)}
              disabled={processing}
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="donor">Donor</option>
              <option value="sponsor">Sponsor</option>
              {/*
              <option value="admin">Admin</option>
              <option value="inventory_manager">Inventory Manager</option> */}
            </select>
            <InputError message={errors.role} />
          </div>

          {data.role === 'sponsor' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="sponsor_type">Sponsor Type</Label>
                <select
                  id="sponsor_type"
                  value={data.sponsor_type}
                  onChange={e => setData('sponsor_type', e.target.value)}
                  disabled={processing}
                  className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Select --</option>
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
                <InputError message={errors.sponsor_type} />
              </div>

              {data.sponsor_type === 'organization' && (
                <div className="grid gap-2">
                  <Label htmlFor="organization_name">Organization Name</Label>
                  <Input
                    id="organization_name"
                    value={data.organization_name}
                    onChange={e => setData('organization_name', e.target.value)}
                    disabled={processing}
                  />
                  <InputError message={errors.organization_name} />
                </div>
              )}
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} disabled={processing} required />
            <InputError message={errors.password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} disabled={processing} required />
            <InputError message={errors.password_confirmation} />
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Create account
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <TextLink href={route('login')}>
            Log in
          </TextLink>
        </div>
      </form>
    </AuthLayout>
  );
}

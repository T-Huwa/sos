import React from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

interface PageProps {
  users: User[];
  [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Users',
        href: route('admin.users.index'),
    },
];

export default function UsersPage() {
  const { users } = usePage<PageProps>().props;

  const handleDeactivate = async (id: number) => {
    if (!confirm(`Are you sure you want to deactivate this user? ${id}`)) return;

    try {
      const res = await router.post(`/admin/users/${id}/deactivate`, {}, { preserveScroll: true });
      console.log(res);
      
      toast.success("User deactivated.");
    } catch {
      toast.error("Failed to deactivate user.");
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm(`Are you sure you want to activate this user? ${id}`)) return;

    try {
      await router.post(`/admin/users/${id}/activate`, {}, { preserveScroll: true });
      toast.success("User activated.");
    } catch {
      toast.error("Failed to activate user.");
    }
  };

  console.log(users);
  

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="All Users" />
      <Card className="max-w-6xl mx-auto mt-10 shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Users</h2>
            <Button onClick={() => router.visit(route('admin.users.create'))}>
              Register User
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || "—"}</TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.visit(`/admin/users/${user.id}/edit`)}
                    >
                      Edit
                    </Button>
                      {user.is_active ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeactivate(user.id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleActivate(user.id)}
                        >
                          Activate
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

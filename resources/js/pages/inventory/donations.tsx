import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

const recentDonations = [
    { id: 1, donor: 'John Banda', child: 'Chisomo Phiri', amount: 'MWK 15,000', type: 'Money', date: '2024-01-15' },
    {
        id: 2,
        donor: 'Mary Mwale',
        child: 'Thandiwe Mwale',
        amount: 'School Supplies',
        type: 'Items',
        date: '2024-01-14',
    },
    {
        id: 3,
        donor: 'Peter Nyirenda',
        child: 'Patrick Nyirenda',
        amount: 'MWK 8,000',
        type: 'Money',
        date: '2024-01-13',
    },
];

export default function ChildrenPage() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Donation Management</CardTitle>
                    <CardDescription>Track and manage all donations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">MWK 2.3M</p>
                                    <p className="text-sm text-gray-600">This Month</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">456</p>
                                    <p className="text-sm text-gray-600">Total Donations</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">MWK 5,043</p>
                                    <p className="text-sm text-gray-600">Average Donation</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Donor</TableHead>
                                <TableHead>Child</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentDonations.map((donation) => (
                                <TableRow key={donation.id}>
                                    <TableCell>{donation.date}</TableCell>
                                    <TableCell>{donation.donor}</TableCell>
                                    <TableCell>{donation.child}</TableCell>
                                    <TableCell>{donation.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{donation.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge>Delivered</Badge>
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

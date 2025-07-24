import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Gift, Heart, Shield, Sparkles, Star } from 'lucide-react';

interface Campaign {
    id: number;
    message: string;
    created_at: string;
    created_by: string;
    first_image?: string;
    images_count: number;
}

interface Props extends SharedData {
    campaigns?: Campaign[];
}

export default function Welcome() {
    const { auth, campaigns } = usePage<Props>().props;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 dark:from-gray-900 dark:to-black dark:text-gray-100">
            <header className="mx-auto mb-6 w-full max-w-[335px] pt-3 text-sm not-has-[nav]:hidden lg:max-w-4xl">
                <nav className="flex items-center justify-end gap-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </header>
            <div className="container mx-auto px-4 py-24 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 text-4xl font-bold md:text-6xl"
                >
                    SOS
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mx-auto mb-8 max-w-2xl text-lg md:text-xl"
                >
                    A Malawian online donation and sponsorship portal connecting kind hearts to communities in need.
                </motion.p>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        {auth.user ? (
                            <Link href={route('dashboard')}>
                                <Button size="lg" className="rounded-2xl px-8 py-6 text-lg shadow-xl">
                                    <Sparkles className="mr-2" /> Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button size="lg" className="rounded-2xl px-8 py-6 text-lg shadow-xl">
                                        <Sparkles className="mr-2" /> Login to Get Started
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="lg" variant="outline" className="rounded-2xl px-8 py-6 text-lg shadow-xl">
                                        Register
                                    </Button>
                                </Link>
                            </>
                        )}
                        <Link href={route('anonymous.donation')}>
                            <Button size="lg" className="rounded-2xl bg-green-600 px-8 py-6 text-lg shadow-xl hover:bg-green-700">
                                Make Anonymous Donation
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* User Types Section */}
            <section className="bg-gray-50 px-4 py-16">
                <div className="container mx-auto">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Join Our Community</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="text-center transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <Gift className="h-8 w-8 text-green-600" />
                                </div>
                                <CardTitle className="text-green-700">Donors</CardTitle>
                                <CardDescription>Make direct donations to children in need</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="mb-6 space-y-2 text-sm text-gray-600">
                                    <li>• Browse children profiles</li>
                                    <li>• Donate money or items</li>
                                    <li>• Track donation history</li>
                                    <li>• Receive thank you letters</li>
                                </ul>
                                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                                    <Link href={route('register')}>Join as Donor</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="text-center transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                    <Star className="h-8 w-8 text-purple-600" />
                                </div>
                                <CardTitle className="text-purple-700">Sponsors</CardTitle>
                                <CardDescription>Long-term support with progress tracking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="mb-6 space-y-2 text-sm text-gray-600">
                                    <li>• Sponsor specific children</li>
                                    <li>• Track academic progress</li>
                                    <li>• Monitor health updates</li>
                                    <li>• Build lasting relationships</li>
                                </ul>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                                    <Link href={route('register')}>Become Sponsor</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="text-center transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-blue-700">Staff</CardTitle>
                                <CardDescription>Manage and monitor the entire system</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="mb-6 space-y-2 text-sm text-gray-600">
                                    <li>• Monitor all inventories</li>
                                    <li>• Generate reports</li>
                                    <li>• Manage donor relations</li>
                                    <li>• Track system analytics</li>
                                </ul>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                    <Link href={route('register')}>Staff Portal</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Active Campaigns */}
            {campaigns && campaigns.length > 0 && (
                <section className="px-4 py-16">
                    <div className="container mx-auto">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Active Campaigns</h2>
                            <p className="text-lg text-gray-600">Support our current initiatives and make a direct impact</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {campaigns.map((campaign) => (
                                <Card key={campaign.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                                    {campaign.first_image && (
                                        <div className="h-48 overflow-hidden">
                                            <img src={campaign.first_image} alt="Campaign" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                {campaign.images_count} image{campaign.images_count !== 1 ? 's' : ''}
                                            </Badge>
                                            <span className="text-xs text-gray-500">{campaign.created_at}</span>
                                        </div>
                                        <CardTitle className="text-lg">{campaign.created_by}'s Campaign</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-sm leading-relaxed text-gray-700">
                                            {campaign.message.length > 120 ? campaign.message.substring(0, 120) + '...' : campaign.message}
                                        </p>
                                        <div className="flex gap-2">
                                            <Link href={`/campaigns/${campaign.id}/donate`} className="flex-1">
                                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                                    <Heart className="mr-2 h-4 w-4" />
                                                    Donate Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Want to see more campaigns or create your own?
                                <Link href={route('register')} className="ml-1 text-blue-600 hover:underline">
                                    Join our community
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-900 px-4 py-12 text-white">
                <div className="container mx-auto">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <div className="mb-4 flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                    <Heart className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">SOS Malawi</span>
                            </div>
                            <p className="text-sm text-gray-400">Supporting children across Malawi through transparent donations and sponsorships.</p>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold">Contact</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Lilongwe, Malawi</li>
                                <li>+265 1 234 567</li>
                                <li>info@sosmalawi.org</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="/children" className="hover:text-white">
                                        Browse Children
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold">Legal</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                        <p>&copy; 2024 SOS Malawi - Support Our Students. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

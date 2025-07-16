import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Gift, Heart, Shield, Star } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex items-center space-x-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                            <Heart className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-blue-900">SOS</span>
                        <span className="text-sm text-gray-600">-Malawi</span>
                    </div>
                    <nav className="hidden items-center space-x-6 md:flex">
                        <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600">
                            How It Works
                        </Link>
                        <Link href="#impact" className="text-gray-600 hover:text-blue-600">
                            Our Impact
                        </Link>
                        <Link href="#about" className="text-gray-600 hover:text-blue-600">
                            About
                        </Link>
                        <Button variant="outline" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-4 py-20">
                <div className="container mx-auto text-center">
                    <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">Thandizani Ana Athu - Help Our Children</Badge>
                    <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">SOS</h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
                        A comprehensive platform connecting generous donors with children across Malawi who need assistance, enabling transparent
                        donations, sponsorships, and progress tracking to create lasting impact in our communities.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href="/donor/signup">Start Donating</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/sponsor/signup">Become a Sponsor</Link>
                        </Button>
                    </div>
                </div>
            </section>

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
                                    <Link href="/donor/signup">Join as Donor</Link>
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
                                    <Link href="/sponsor/signup">Become Sponsor</Link>
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
                                    <Link href="/staff/login">Staff Portal</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Impact Statistics */}
            <section id="impact" className="bg-blue-600 px-4 py-16 text-white">
                <div className="container mx-auto text-center">
                    <h2 className="mb-12 text-3xl font-bold">Our Impact in Malawi</h2>
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <div className="mb-2 text-4xl font-bold">2,847</div>
                            <div className="text-blue-100">Children Supported</div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold">MWK 45M</div>
                            <div className="text-blue-100">Total Donations</div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold">1,256</div>
                            <div className="text-blue-100">Active Donors</div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold">542</div>
                            <div className="text-blue-100">Sponsored Children</div>
                        </div>
                    </div>
                </div>
            </section>

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
                                    <Link href="/about" className="hover:text-white">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold">Legal</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="/privacy" className="hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="hover:text-white">
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

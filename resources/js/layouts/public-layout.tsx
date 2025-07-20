import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';
import { ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    showBackButton?: boolean;
    backUrl?: string;
}

export default function PublicLayout({ children, showBackButton = true, backUrl = '/' }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {showBackButton && (
                                <Link href={backUrl}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                            )}
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                                    S
                                </div>
                                <span className="text-xl font-bold text-gray-900">SOS</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/">
                                <Button variant="outline" size="sm">
                                    <Home className="mr-2 h-4 w-4" />
                                    Home
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="sm">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600">
                        <p>&copy; 2024 SOS. Making a difference together.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

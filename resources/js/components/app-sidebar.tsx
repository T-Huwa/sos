import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { DollarSign, File, Folder, Heart, LayoutDashboard, MessageCircle, Users, Users2 } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    // admin routes
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: route('admin.users.index'),
        icon: Users2,
        role: ['admin'],
    },

    // staff routes
    {
        title: 'Inventory',
        href: route('inventory.inventory'),
        icon: File,
        role: ['admin', 'inventory_manager'],
    },
    {
        title: 'Children',
        href: route('inventory.children'),
        icon: Users,
        role: ['inventory_manager'],
    },
    // {
    //     title: 'Communications',
    //     href: route('inventory.communications'),
    //     icon: FileEdit,
    //     role: ['inventory_manager'],
    // },
    {
        title: 'Donations',
        href: route('inventory.donations'),
        icon: DollarSign,
        role: ['inventory_manager'],
    },
    {
        title: 'Campaigns',
        href: route('inventory.campaigns.index'),
        icon: MessageCircle,
        role: ['inventory_manager'],
    },
    // {
    //     title: 'Reports',
    //     href: route('inventory.reports'),
    //     icon: FileChartPie,
    //     role: ['inventory_manager'],
    // },

    // donor routes
    {
        title: 'Donations',
        href: route('donor.donations'),
        icon: DollarSign,
        role: ['donor'],
    },
    {
        title: 'Children',
        href: route('donor.children'),
        icon: Users,
        role: ['donor'],
    },
    {
        title: 'Donate',
        href: route('donor.donate'),
        icon: DollarSign,
        role: ['donor'],
    },
    // {
    //     title: 'History',
    //     href: route('donor.history'),
    //     icon: History,
    //     role: ['donor'],
    // },

    // sponsor dashboard
    {
        title: 'Browse Children',
        href: route('sponsor.children'),
        icon: Users,
        role: ['sponsor'],
    },
    {
        title: 'My Sponsorships',
        href: route('sponsor.my-sponsorships'),
        icon: Heart,
        role: ['sponsor'],
    },
    {
        title: 'Make Donation',
        href: route('donor.donate'),
        icon: DollarSign,
        role: ['sponsor'],
    },
    {
        title: 'Communication',
        href: route('donor.history'),
        icon: MessageCircle,
        role: ['sponsor'],
    },

    /*
    <TabsList>
        <TabsTrigger value="children">My Sponsored Children</TabsTrigger>
        <TabsTrigger value="updates">Recent Updates</TabsTrigger>
        <TabsTrigger value="contributions">My Contributions</TabsTrigger>
        <TabsTrigger value="communication">Communication</TabsTrigger>
    </TabsList>,*/
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    Bell,
    Shield,
    Layers
} from 'lucide-react';
import clsx from 'clsx';
import { User } from '@/types';

interface SidebarItem {
    label: string;
    href: string;
    icon: any;
    roles?: User['role'][];
}

const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clubs', href: '/clubs', icon: Layers },
    { label: 'My Clubs', href: '/dashboard/my-clubs', icon: Users, roles: ['MEMBER', 'CLUB_LEADER'] },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Profile', href: '/dashboard/profile', icon: Settings },

    // Leader Only
    { label: 'Manage Club', href: '/dashboard/leader/manage', icon: Shield, roles: ['CLUB_LEADER'] },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const filteredItems = items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(user.role);
    });

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                    AAU Clubs
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                )}
                            >
                                <Icon className={clsx('mr-3 h-5 w-5', isActive ? 'text-indigo-600' : 'text-gray-400')} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                        {user.firstName[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

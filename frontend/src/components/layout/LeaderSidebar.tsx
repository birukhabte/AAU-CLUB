"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Megaphone,
  Settings,
  ClipboardList,
} from 'lucide-react';

const leaderMenu = [
  {
    title: 'Dashboard',
    href: '/dashboard/leader',
    icon: LayoutDashboard,
  },
  {
    title: 'My Club',
    href: '/dashboard/leader/club',
    icon: Settings,
    description: 'Manage club details and status',
  },
  {
    title: 'Member Requests',
    href: '/dashboard/leader/requests',
    icon: ClipboardList,
    description: 'Approve or reject member registrations',
  },
  {
    title: 'Members',
    href: '/dashboard/leader/members',
    icon: Users,
    description: 'View and export club members',
  },
  {
    title: 'Events',
    href: '/dashboard/leader/events',
    icon: CalendarCheck,
    description: 'Create and manage club events',
  },
  {
    title: 'Announcements',
    href: '/dashboard/leader/announcements',
    icon: Megaphone,
    description: 'Send notifications to members',
  },
];

export default function LeaderSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getInitials = () => {
    if (!user) return 'L';
    return user.firstName?.charAt(0).toUpperCase() || 'L';
  };

  return (
    <aside className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
      {/* Header with User Avatar */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
            {getInitials()}
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs text-slate-400">Club Leader</p>
          </div>
        </div>
        <h1 className="text-lg font-bold tracking-wide">
          Club Leader Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {leaderMenu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
        Addis Ababa University<br />
        Club Management System
      </div>
    </aside>
  );
}

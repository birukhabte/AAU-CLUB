"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users,
  CalendarDays,
  Bell,
  MessageSquare,
  User,
} from 'lucide-react';

const memberMenu = [
  {
    title: 'Dashboard',
    href: '/member-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Browse Clubs',
    href: '/clubs',
    icon: Search,
    description: 'Find and join clubs',
  },
  {
    title: 'My Clubs',
    href: '/dashboard/my-clubs',
    icon: Users,
    description: 'Clubs you have joined',
  },
  {
    title: 'Events',
    href: '/dashboard/events',
    icon: CalendarDays,
    description: 'RSVP for club events',
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'Announcements & updates',
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    description: 'Communicate with club leaders',
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
];

export default function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide">
          Student Panel
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Club participation
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {memberMenu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-indigo-600 text-white'
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

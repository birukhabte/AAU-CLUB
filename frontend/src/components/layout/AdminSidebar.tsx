"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  BarChart3,
  ClipboardList,
  Settings,
} from 'lucide-react';

const adminMenu = [
  {
    title: 'Dashboard',
    href: '/admin-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Clubs Management',
    href: '/admin-dashboard/clubs',
    icon: ClipboardList,
    description: 'Create, update, activate or deactivate clubs',
  },
  {
    title: 'Users & Roles',
    href: '/admin-dashboard/users',
    icon: Users,
    description: 'Manage users and assign roles',
  },
  {
    title: 'Events Management',
    href: '/admin-dashboard/events',
    icon: CalendarDays,
    description: 'Oversee all club events',
  },
  {
    title: 'Announcements',
    href: '/admin-dashboard/announcements',
    icon: Megaphone,
    description: 'Moderate announcements',
  },
  {
    title: 'Reports',
    href: '/admin-dashboard/reports',
    icon: BarChart3,
    description: 'View system analytics & activity logs',
  },
  {
    title: 'System Settings',
    href: '/admin-dashboard/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide">
          AAU Admin Panel
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Full system access
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminMenu.map((item) => {
          const isActive = item.href === '/admin-dashboard'
            ? pathname === '/admin-dashboard'
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? 'bg-blue-600 text-white'
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

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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from '@/app/admin-dashboard/layout';

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
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <aside 
      className={`h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800 relative">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold tracking-wide">
              AAU Admin Panel
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Full system access
            </p>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
              A
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-1.5 border-2 border-slate-900 transition-colors shadow-lg"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {adminMenu.map((item) => {
          const isActive = item.href === '/admin-dashboard'
            ? pathname === '/admin-dashboard'
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              title={isCollapsed ? item.title : ''}
            >
              <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.title}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
          Addis Ababa University<br />
          Club Management System
        </div>
      )}
    </aside>
  );
}

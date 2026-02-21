"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';

// Create context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only redirect after component is mounted and auth is loaded
        if (mounted && !isLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [mounted, user, isLoading, router]);

    // Show loading state during SSR and initial auth check
    if (!mounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <AdminSidebar />
                <div 
                    className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
                        isCollapsed ? 'ml-20' : 'ml-64'
                    }`}
                    style={{
                        width: isCollapsed ? 'calc(100% - 5rem)' : 'calc(100% - 16rem)'
                    }}
                >
                    <header className="bg-white shadow-sm border-b border-gray-200">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
                                <div className="flex items-center">
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}

"use client";

import LeaderSidebar from '@/components/layout/LeaderSidebar';
import MemberSidebar from '@/components/layout/MemberSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only redirect after component is mounted and auth is loaded
        if (mounted && !isLoading && !user) {
            router.push('/login');
        }
    }, [mounted, isLoading, user, router]);

    // Show loading state during SSR and initial auth check
    if (!mounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) return null;

    // Render appropriate sidebar based on user role
    const renderSidebar = () => {
        if (user.role === 'CLUB_LEADER') {
            return <LeaderSidebar />;
        } else if (user.role === 'MEMBER') {
            return <MemberSidebar />;
        }
        return null;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <div className="hidden md:flex md:flex-shrink-0">
                {renderSidebar()}
            </div>
            <div className="flex-1 flex flex-col md:pl-64 w-0 min-w-0">
                <main className="relative flex-1 overflow-y-auto focus:outline-none bg-gray-100 p-6">
                    <div className="py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

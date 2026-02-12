"use client";

import LeaderSidebar from '@/components/layout/LeaderSidebar';
import MemberSidebar from '@/components/layout/MemberSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
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

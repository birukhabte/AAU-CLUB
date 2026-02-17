"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserCheck, UserX, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ClubStats {
    totalMembers: number;
    pendingRequests: number;
    approvedMembers: number;
    rejectedRequests: number;
}

export default function LeaderDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ClubStats>({
        totalMembers: 0,
        pendingRequests: 0,
        approvedMembers: 0,
        rejectedRequests: 0,
    });
    const [clubName, setClubName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Get the club where the user is the leader
            const clubsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!clubsResponse.ok) throw new Error('Failed to fetch clubs');

            const clubsData = await clubsResponse.json();
            const leaderClub = clubsData.data.find((club: any) => club.leader.id === user?.id);

            if (!leaderClub) {
                setLoading(false);
                return;
            }

            setClubName(leaderClub.name);

            // Fetch all members to calculate stats
            const membersResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/clubs/${leaderClub.id}/members`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!membersResponse.ok) throw new Error('Failed to fetch members');

            const membersData = await membersResponse.json();
            const members = membersData.data;

            setStats({
                totalMembers: members.length,
                pendingRequests: members.filter((m: any) => m.status === 'PENDING').length,
                approvedMembers: members.filter((m: any) => m.status === 'APPROVED').length,
                rejectedRequests: members.filter((m: any) => m.status === 'REJECTED').length,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(2_116_181)]" />
            </div>
        );
    }

    if (!clubName) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Club Found</h3>
                <p className="text-yellow-700">
                    You are not currently assigned as a leader of any club. Please contact an administrator.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Club Leader Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Managing: <span className="font-semibold text-[rgb(2_116_181)]">{clubName}</span>
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">Total Members</h3>
                        <Users className="w-5 h-5 text-[rgb(2_116_181)]" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
                    <p className="text-sm text-gray-500 mt-2">All membership records</p>
                </div>

                <Link href="/dashboard/leader/requests">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700">Pending Requests</h3>
                            <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                        <p className="text-sm text-orange-600 mt-2 font-medium">Click to review →</p>
                    </div>
                </Link>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">Approved Members</h3>
                        <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.approvedMembers}</p>
                    <p className="text-sm text-gray-500 mt-2">Active club members</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">Rejected</h3>
                        <UserX className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.rejectedRequests}</p>
                    <p className="text-sm text-gray-500 mt-2">Declined requests</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/leader/requests"
                        className="p-4 border-2 border-[rgb(2_116_181_/_20%)] rounded-lg hover:border-[rgb(2_116_181)] hover:bg-[rgb(2_116_181_/_5%)] transition-all"
                    >
                        <h4 className="font-semibold text-gray-800 mb-1">Review Requests</h4>
                        <p className="text-sm text-gray-600">Approve or reject membership requests</p>
                    </Link>
                    <Link
                        href="/dashboard/leader/members"
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-[rgb(2_116_181)] hover:bg-[rgb(2_116_181_/_5%)] transition-all"
                    >
                        <h4 className="font-semibold text-gray-800 mb-1">View Members</h4>
                        <p className="text-sm text-gray-600">See all club members and their details</p>
                    </Link>
                    <Link
                        href="/dashboard/leader/events"
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-[rgb(2_116_181)] hover:bg-[rgb(2_116_181_/_5%)] transition-all"
                    >
                        <h4 className="font-semibold text-gray-800 mb-1">Manage Events</h4>
                        <p className="text-sm text-gray-600">Create and manage club events</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

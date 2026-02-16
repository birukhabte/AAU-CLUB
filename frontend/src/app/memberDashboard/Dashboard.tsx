import React from 'react';
import { Calendar, Users, Clock, Bell, TrendingUp, BookOpen } from 'lucide-react';

interface MemberClub {
    id: string;
    name: string;
    category: string;
    role: string;
    nextMeeting: string;
    pendingTasks: number;
    unreadAnnouncements: number;
}

const MemberDashboard: React.FC = () => {
    // This would come from your backend/state management
    const myClubs: MemberClub[] = [
        {
            id: '1',
            name: 'Basketball Team',
            category: 'Sports',
            role: 'Member',
            nextMeeting: 'Today, 5:00 PM',
            pendingTasks: 2,
            unreadAnnouncements: 3
        },
        {
            id: '2',
            name: 'Robotics Club',
            category: 'Technology',
            role: 'Team Lead',
            nextMeeting: 'Tomorrow, 3:30 PM',
            pendingTasks: 5,
            unreadAnnouncements: 1
        },
    ];

    const upcomingEvents = [
        { id: 1, club: 'Basketball Team', event: 'Practice Match', time: 'Today, 5:00 PM', location: 'Court A' },
        { id: 2, club: 'Robotics Club', event: 'Workshop', time: 'Tomorrow, 3:30 PM', location: 'Lab 204' },
        { id: 3, club: 'Debate Society', event: 'Tournament Prep', time: 'Wed, 4:00 PM', location: 'Room 105' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, Alex! 👋</h1>
                <p className="text-gray-600">Here's what's happening with your clubs</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <Users className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-2xl font-bold">{myClubs.length}</p>
                    <p className="text-sm opacity-90">Active Clubs</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <Calendar className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm opacity-90">Events This Week</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <Clock className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm opacity-90">Hours This Month</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <TrendingUp className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-sm opacity-90">Attendance Rate</p>
                </div>
            </div>

            {/* My Clubs Section - Primary Focus */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">My Clubs</h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All →
                    </button>
                </div>
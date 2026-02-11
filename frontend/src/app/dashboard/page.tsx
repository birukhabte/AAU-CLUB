"use client";

import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome back, {user.firstName}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">My Clubs</h3>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-500 mt-2">Active memberships</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Upcoming Events</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">This Week</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">2</p>
                    <p className="text-sm text-gray-500 mt-2">Events to attend</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Notifications</h3>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">New</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500 mt-2">Unread messages</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
                <ul className="space-y-4">
                    <li className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Joined "AAU Tech Hub"</span>
                        <span className="text-gray-400 text-xs ml-auto">2 days ago</span>
                    </li>
                    <li className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>RSVP'd to "Hackathon 2026"</span>
                        <span className="text-gray-400 text-xs ml-auto">5 days ago</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

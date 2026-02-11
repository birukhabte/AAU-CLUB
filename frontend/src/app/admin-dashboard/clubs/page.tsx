"use client";

import Link from 'next/link';

export default function AdminClubsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin-dashboard" className="text-indigo-600 hover:text-indigo-800">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Club Management</h1>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">All Clubs</h2>
                        <p className="text-gray-600">Club management interface coming soon...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

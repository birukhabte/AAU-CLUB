"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { User, Search, Filter, Shield, UserCheck, UserX, Loader2 } from 'lucide-react';

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    phone?: string;
    avatar?: string;
    role: 'ADMIN' | 'CLUB_LEADER' | 'MEMBER';
    isActive: boolean;
    createdAt: string;
    _count?: {
        memberships: number;
    };
}

interface PaginatedResponse {
    success: boolean;
    data: UserData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export default function AdminUsersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
    });

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params: any = { page, limit: 10 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;

            const response = await api.get<PaginatedResponse>('/users', { params });
            setUsers(response.data.data);
            setPagination({
                total: response.data.pagination.total,
                pages: response.data.pagination.pages,
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await api.patch(`/users/${userId}/toggle-status`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800';
            case 'CLUB_LEADER':
                return 'bg-blue-100 text-blue-800';
            case 'MEMBER':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin-dashboard" className="text-indigo-600 hover:text-indigo-800">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Search and Filter */}
                    <div className="bg-white shadow rounded-lg p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name or email..."
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                                >
                                    Search
                                </button>
                            </form>
                            <div className="relative">
                                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="CLUB_LEADER">Club Leader</option>
                                    <option value="MEMBER">Member</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                All Users ({pagination.total})
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Clubs
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((userData) => (
                                            <tr key={userData.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {userData.avatar ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full"
                                                                    src={userData.avatar}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                    <User className="h-5 w-5 text-indigo-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {userData.firstName} {userData.lastName}
                                                            </div>
                                                            {userData.studentId && (
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {userData.studentId}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{userData.email}</div>
                                                    {userData.phone && (
                                                        <div className="text-sm text-gray-500">{userData.phone}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={userData.role}
                                                        onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                                                            userData.role
                                                        )} border-0 focus:ring-2 focus:ring-indigo-500`}
                                                        disabled={userData.id === user?.id}
                                                    >
                                                        <option value="ADMIN">Admin</option>
                                                        <option value="CLUB_LEADER">Club Leader</option>
                                                        <option value="MEMBER">Member</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            userData.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {userData.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {userData._count?.memberships || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleToggleStatus(userData.id)}
                                                        disabled={userData.id === user?.id}
                                                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                                                            userData.isActive
                                                                ? 'text-red-700 hover:bg-red-50'
                                                                : 'text-green-700 hover:bg-green-50'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {userData.isActive ? (
                                                            <>
                                                                <UserX className="h-4 w-4 mr-1" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="h-4 w-4 mr-1" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Page {page} of {pagination.pages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === pagination.pages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

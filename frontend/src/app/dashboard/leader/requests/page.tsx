"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Check, X, User, Mail, Phone, Calendar, Loader2 } from 'lucide-react';

interface MemberRequest {
    id: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        studentId: string;
        phone?: string;
        avatar?: string;
    };
}

export default function MemberRequestsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MemberRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [clubId, setClubId] = useState<string | null>(null);

    useEffect(() => {
        fetchClubAndRequests();
    }, []);

    const fetchClubAndRequests = async () => {
        try {
            setLoading(true);

            // First, get the club where the user is the leader
            const clubsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clubs`, {
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

            setClubId(leaderClub.id);

            // Then fetch pending membership requests for this club
            const requestsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/clubs/${leaderClub.id}/members?status=PENDING`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!requestsResponse.ok) throw new Error('Failed to fetch requests');

            const requestsData = await requestsResponse.json();
            setRequests(requestsData.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (membershipId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            setProcessingId(membershipId);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/memberships/${membershipId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) throw new Error('Failed to update membership');

            // Remove the processed request from the list
            setRequests(requests.filter(req => req.id !== membershipId));
        } catch (error) {
            console.error('Error updating membership:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(2_116_181)]" />
            </div>
        );
    }

    if (!clubId) {
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
                <h1 className="text-2xl font-bold text-gray-800">Member Requests</h1>
                <p className="text-gray-600 mt-1">
                    Review and approve membership requests for your club
                </p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Requests</h3>
                    <p className="text-gray-600">
                        There are currently no membership requests waiting for approval.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    {/* Avatar */}
                                    <div className="w-14 h-14 bg-[rgb(2_116_181_/_10%)] rounded-full flex items-center justify-center flex-shrink-0">
                                        {request.user.avatar ? (
                                            <img
                                                src={request.user.avatar}
                                                alt={`${request.user.firstName} ${request.user.lastName}`}
                                                className="w-14 h-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-7 h-7 text-[rgb(2_116_181)]" />
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {request.user.firstName} {request.user.lastName}
                                        </h3>
                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {request.user.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                Student ID: {request.user.studentId}
                                            </div>
                                            {request.user.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                    {request.user.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                Requested on {new Date(request.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-3 ml-4">
                                    <button
                                        onClick={() => handleRequest(request.id, 'APPROVED')}
                                        disabled={processingId === request.id}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                                    >
                                        {processingId === request.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        onClick={() => handleRequest(request.id, 'REJECTED')}
                                        disabled={processingId === request.id}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                                    >
                                        {processingId === request.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                        <span>Reject</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

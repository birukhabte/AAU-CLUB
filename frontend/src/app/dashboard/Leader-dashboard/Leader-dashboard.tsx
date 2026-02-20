"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, UserCheck, UserX, Calendar, 
  Info, Edit2, Mail, Award, TrendingUp, AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface ClubInfo {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  description: string;
  createdAt: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  membershipStats: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
  _count: {
    events: number;
    announcements: number;
  };
}

const LeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderClubs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clubs/my/leader');
        
        if (response.data.success && response.data.data.length > 0) {
          // Get the first club (assuming a leader manages one club)
          setClubInfo(response.data.data[0]);
        } else {
          setError('No club assigned to you as a leader');
        }
      } catch (err: any) {
        console.error('Error fetching leader clubs:', err);
        setError(err.response?.data?.message || 'Failed to load club data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaderClubs();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your club data...</p>
        </div>
      </div>
    );
  }

  if (error || !clubInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">No Club Assigned</h2>
          <p className="text-gray-600 text-center">{error || 'You are not assigned as a leader to any club yet.'}</p>
        </div>
      </div>
    );
  }

  // Stats cards data
  const stats = [
    { 
      label: 'Total Members', 
      value: clubInfo.membershipStats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Pending Requests', 
      value: clubInfo.membershipStats.pending,
      icon: UserPlus,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'Approved Members', 
      value: clubInfo.membershipStats.approved,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'Rejected Requests', 
      value: clubInfo.membershipStats.rejected,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 -ml-6">
      {/* Header */}
      <div className="border-b border-gray-200 -mx-6 -mt-8 mb-6">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Leader Dashboard</h1>
              <p className="text-gray-600">Manage your club and members</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Club Info
            </button>
          </div>
        </div>
      </div>

      {/* 🏷️ Club Overview Section */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Club Overview</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              clubInfo.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : clubInfo.status === 'INACTIVE'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {clubInfo.status === 'ACTIVE' ? '● Active' : clubInfo.status === 'INACTIVE' ? '○ Inactive' : '⊗ Suspended'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{clubInfo.name}</h3>
              <p className="text-sm text-blue-600 mb-3">{clubInfo.category}</p>
              <p className="text-gray-600 mb-4">{clubInfo.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">Created:</span>
                  {formatDate(clubInfo.createdAt)}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">Leader:</span>
                    <p className="text-gray-600 mt-1">
                      {clubInfo.leader.firstName} {clubInfo.leader.lastName}
                    </p>
                    <p className="text-gray-500 text-xs">{clubInfo.leader.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs text-gray-600">View Members</span>
                </button>
                <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <span className="text-xs text-gray-600">Create Event</span>
                </button>
                <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-center">
                  <Mail className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <span className="text-xs text-gray-600">Announcement</span>
                </button>
                <button className="p-3 bg-white rounded-lg hover:shadow-md transition-shadow text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                  <span className="text-xs text-gray-600">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 👥 Member Statistics Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Member Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  <div className={`w-1 h-12 ${stat.color} rounded-full`}></div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`${stat.color} h-1.5 rounded-full`} 
                      style={{ width: `${Math.min(100, (stat.value / Math.max(clubInfo.membershipStats.total, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Club Activity Summary */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Club Activity</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-800">{clubInfo._count.events}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Announcements</p>
                  <p className="text-2xl font-bold text-gray-800">{clubInfo._count.announcements}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;
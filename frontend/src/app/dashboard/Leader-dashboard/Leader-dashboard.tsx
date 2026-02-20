"use client";

import React, { useState } from 'react';
import { 
  Users, UserPlus, UserCheck, UserX, Calendar, 
  Info, Edit2, Mail, Award, TrendingUp
} from 'lucide-react';

interface ClubInfo {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
  leaders: string[];
  memberCount: number;
  pendingRequests: number;
  approvedMembers: number;
  rejectedRequests: number;
}

const LeaderDashboard: React.FC = () => {
  // Mock data - would come from API
  const [clubInfo] = useState<ClubInfo>({
    id: '1',
    name: 'Robotics Club',
    category: 'Technology',
    status: 'active',
    description: 'Building innovative robots and fostering tech innovation at AAU',
    createdAt: 'January 15, 2024',
    leaders: ['Dr. Sarah Johnson (Advisor)', 'Michael Chen (President)'],
    memberCount: 45,
    pendingRequests: 8,
    approvedMembers: 42,
    rejectedRequests: 3
  });

  // Stats cards data
  const stats = [
    { 
      label: 'Total Members', 
      value: clubInfo.memberCount,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Pending Requests', 
      value: clubInfo.pendingRequests,
      icon: UserPlus,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'Approved Members', 
      value: clubInfo.approvedMembers,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'Rejected Requests', 
      value: clubInfo.rejectedRequests,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
  ];

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
              clubInfo.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {clubInfo.status === 'active' ? '● Active' : '○ Inactive'}
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
                  {clubInfo.createdAt}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium">Leaders:</span>
                    <ul className="mt-1 space-y-1">
                      {clubInfo.leaders.map((leader, index) => (
                        <li key={index} className="text-gray-600">• {leader}</li>
                      ))}
                    </ul>
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
                      style={{ width: `${Math.min(100, (stat.value / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm text-gray-800">5 new members joined</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">+5</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm text-gray-800">Club meeting scheduled for Friday</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">New</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm text-gray-800">3 pending requests to review</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;
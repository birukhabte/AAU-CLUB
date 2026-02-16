"use client";

import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface Club {
  id: string;
  name: string;
  category: string;
  _count?: {
    memberships: number;
  };
  members?: number; // fallback or mapped
  description: string;
  meetingDay: string | null;
  location: string | null;
  // UI state derived from memberships
  isJoined: boolean;
  membershipStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

interface Membership {
  id: string;
  clubId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function ClubsDirectoryPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsRes, membershipsRes, categoriesRes] = await Promise.all([
        api.get('/clubs'),
        user ? api.get('/memberships/my-memberships') : Promise.resolve({ data: { data: [] } }),
        api.get('/clubs/categories')
      ]);

      const fetchedClubs = clubsRes.data.data;
      const myMemberships = membershipsRes.data.data as Membership[];
      const fetchedCategories = ['All', ...categoriesRes.data.data];

      // Map memberships for easy lookup
      const membershipMap = new Map<string, string>();
      myMemberships.forEach(m => {
        membershipMap.set(m.clubId, m.status);
      });

      // Merge data
      const processedClubs = fetchedClubs.map((club: any) => ({
        ...club,
        members: club._count?.memberships || 0,
        isJoined: membershipMap.has(club.id) && membershipMap.get(club.id) === 'APPROVED',
        membershipStatus: membershipMap.get(club.id) || null
      }));

      setClubs(processedClubs);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (!user) {
      alert("Please login to join a club");
      return;
    }
    try {
      setActionLoading(clubId);
      await api.post(`/memberships/join/${clubId}`);

      // Update local state
      setClubs(prev => prev.map(club => {
        if (club.id === clubId) {
          return { ...club, membershipStatus: 'PENDING' };
        }
        return club;
      }));
    } catch (error) {
      console.error("Failed to join club:", error);
      alert("Failed to join club. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    if (!confirm("Are you sure you want to leave this club?")) return;

    try {
      setActionLoading(clubId);
      await api.delete(`/memberships/leave/${clubId}`);

      // Update local state
      setClubs(prev => prev.map(club => {
        if (club.id === clubId) {
          return { ...club, isJoined: false, membershipStatus: null };
        }
        return club;
      }));
    } catch (error: any) {
      console.error("Failed to leave club:", error);
      alert(error.response?.data?.message || "Failed to leave club");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getButtonState = (club: Club) => {
    if (actionLoading === club.id) {
      return (
        <button disabled className="w-full py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-400 flex justify-center items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </button>
      );
    }

    if (club.membershipStatus === 'APPROVED') {
      return (
        <button
          onClick={() => handleLeaveClub(club.id)}
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100"
        >
          Leave Club
        </button>
      );
    }

    if (club.membershipStatus === 'PENDING') {
      return (
        <button
          disabled
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-orange-100 text-orange-800 cursor-not-allowed"
        >
          Request Pending
        </button>
      );
    }

    return (
      <button
        onClick={() => handleJoinClub(club.id)}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
      >
        Join Club
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Browse Clubs</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clubs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => (
          <div key={club.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{club.name}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {club.category}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{club.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span>{club.members} members</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{club.meetingDay || 'TBA'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{club.location || 'TBA'}</span>
              </div>
            </div>

            {getButtonState(club)}
          </div>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No clubs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}








"use client";

import React, { useState } from 'react';
import { Search, Users, Calendar, MapPin } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  category: string;
  members: number;
  description: string;
  meetingDay: string;
  location: string;
  isJoined: boolean;
}

export default function ClubsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const clubs: Club[] = [
    { id: '1', name: 'Robotics Club', category: 'Technology', members: 45, description: 'Build and program robots', meetingDay: 'Tuesdays', location: 'Engineering Bldg', isJoined: false },
    { id: '2', name: 'Basketball Team', category: 'Sports', members: 28, description: 'Competitive basketball', meetingDay: 'Mon & Wed', location: 'Sports Complex', isJoined: true },
    { id: '3', name: 'Debate Society', category: 'Academic', members: 35, description: 'Public speaking & debates', meetingDay: 'Thursdays', location: 'Liberal Arts', isJoined: false },
    { id: '4', name: 'Chess Club', category: 'Games', members: 22, description: 'Strategic chess matches', meetingDay: 'Fridays', location: 'Student Union', isJoined: false },
  ];

  const categories = ['All', 'Technology', 'Sports', 'Academic', 'Arts', 'Games'];
  
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleJoin = (clubId: string) => {
    // Handle join/leave logic here
    console.log(`Toggling club ${clubId}`);
  };

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
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{club.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span>{club.members} members</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{club.meetingDay}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{club.location}</span>
              </div>
            </div>

            <button
              onClick={() => toggleJoin(club.id)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                club.isJoined
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {club.isJoined ? 'Leave Club' : 'Join Club'}
            </button>
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








"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";

interface MembershipSummary {
  id: string;
  status: string;
  club: {
    id: string;
    name: string;
    logo?: string | null;
    category: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    studentId?: string | null;
    phone?: string | null;
    avatar?: string | null;
    bio?: string | null;
    role: string;
    createdAt: string;
    memberships: MembershipSummary[];
  };
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<ProfileResponse>("/auth/profile");
        setProfile(data.data);
        updateUser({
          id: data.data.id,
          email: data.data.email,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          role: data.data.role as any,
          avatar: data.data.avatar ?? undefined,
          isActive: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [updateUser]);

  if (isLoading || !profile || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h1>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div
              className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700"
              aria-label={`${profile.firstName} ${profile.lastName} avatar`}
            >
              {profile.firstName[0]}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</p>
              <p className="text-sm text-gray-900">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-900">{profile.email}</p>
            </div>
            {profile.studentId && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student ID</p>
                <p className="text-sm text-gray-900">{profile.studentId}</p>
              </div>
            )}
            {profile.phone && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-sm text-gray-900">{profile.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</p>
              <p className="text-sm text-gray-900">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Member since</p>
              <p className="text-sm text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {profile.bio && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</p>
            <p className="text-sm text-gray-700 mt-1">{profile.bio}</p>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Joined Clubs</h2>
        {profile.memberships.length === 0 ? (
          <p className="text-sm text-gray-500">You have not joined any clubs yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.memberships.map((membership) => (
              <li
                key={membership.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start gap-3 bg-gray-50"
              >
                {membership.club.logo && (
                  <img
                    src={membership.club.logo}
                    alt={`${membership.club.name} logo`}
                    className="h-10 w-10 rounded-full object-cover mt-1"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{membership.club.name}</p>
                  <p className="text-xs text-indigo-700 font-medium">{membership.club.category}</p>
                  <p className="mt-1 text-xs text-gray-600">Status: {membership.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}







"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

interface ClubDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string | null;
  coverImage?: string | null;
  status: string;
  meetingDay?: string | null;
  meetingTime?: string | null;
  location?: string | null;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };
  _count: {
    memberships: number;
    events: number;
  };
  events: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  }[];
  announcements: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  }[];
}

interface MembershipStatusResponse {
  success: boolean;
  data: {
    isMember: boolean;
    status: "APPROVED" | "PENDING" | "REJECTED" | null;
  };
}

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatusResponse["data"] | null>(null);

  const clubId = params?.id;

  useEffect(() => {
    if (!clubId) return;
    const fetchClub = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<{ success: boolean; data: ClubDetail }>(`/clubs/${clubId}`);
        setClub(data.data);
        if (user) {
          const statusRes = await api.get<MembershipStatusResponse>(`/memberships/check/${clubId}`);
          setMembershipStatus(statusRes.data.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClub();
  }, [clubId, user]);

  const handleJoin = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!clubId) return;
    setJoining(true);
    try {
      await api.post(`/memberships/join/${clubId}`);
      const statusRes = await api.get<MembershipStatusResponse>(`/memberships/check/${clubId}`);
      setMembershipStatus(statusRes.data.data);
    } finally {
      setJoining(false);
    }
  };

  const joinLabel = (() => {
    if (!user) return "Sign in to join";
    if (!membershipStatus) return "Join Club";
    if (membershipStatus.isMember) return "You are a member";
    if (membershipStatus.status === "PENDING") return "Request pending";
    if (membershipStatus.status === "REJECTED") return "Re-apply to join";
    return "Join Club";
  })();

  const joinDisabled =
    joining || (membershipStatus?.isMember ?? false) || membershipStatus?.status === "PENDING";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mr-4"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
          Back
        </button>
        <Link className="flex items-center justify-center font-bold text-2xl text-indigo-600" href="/">
          AAU Clubs
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {!user && (
            <>
              <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700" href="/login">
                Sign In
              </Link>
              <Link
                className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                href="/register"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading club">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : !club ? (
          <p className="text-center text-gray-500 py-12">Club not found.</p>
        ) : (
          <>
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              {club.coverImage && (
                <img
                  src={club.coverImage}
                  alt={`${club.name} cover`}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {club.logo && (
                      <img
                        src={club.logo}
                        alt={`${club.name} logo`}
                        className="h-16 w-16 rounded-full object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                      <p className="mt-1 text-sm text-indigo-600 font-medium uppercase tracking-wide">
                        {club.category}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-4 w-4" aria-hidden="true" />
                          {club._count.memberships} members
                        </span>
                        {club.meetingDay && club.meetingTime && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            {club.meetingDay} · {club.meetingTime}
                          </span>
                        )}
                        {club.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" aria-hidden="true" />
                            {club.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleJoin}
                      disabled={joinDisabled}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-transparent text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    >
                      {joining && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />}
                      {joinLabel}
                    </button>
                    <p className="text-xs text-gray-500">
                      Your request will be reviewed by the club leader.
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm text-gray-700 leading-relaxed">{club.description}</p>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-800">Club Leader</p>
                    <p>
                      {club.leader.firstName} {club.leader.lastName}
                    </p>
                    <p className="text-gray-500">{club.leader.email}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                  <Link
                    href="/dashboard/events"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View all events
                  </Link>
                </div>
                {club.events.length === 0 ? (
                  <p className="text-sm text-gray-500">No upcoming events scheduled.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {club.events.map((event) => (
                      <li key={event.id} className="py-3">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString()} · {event.time} · {event.location}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h2>
                {club.announcements.length === 0 ? (
                  <p className="text-sm text-gray-500">No announcements yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {club.announcements.map((a) => (
                      <li key={a.id}>
                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {a.author.firstName} {a.author.lastName} ·{" "}
                          {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{a.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}







"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

interface AdminDashboardResponse {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      totalClubs: number;
      activeClubs: number;
      totalEvents: number;
      upcomingEvents: number;
      totalMemberships: number;
      pendingMemberships: number;
    };
    recentUsers: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      createdAt: string;
    }[];
    recentClubs: {
      id: string;
      name: string;
      category: string;
      status: string;
      createdAt: string;
      _count: { memberships: number };
    }[];
    clubsByCategory: {
      category: string;
      count: number;
    }[];
    monthlyRegistrations: Record<string, number>;
  };
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardResponse["data"] | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const res = await api.get<AdminDashboardResponse>("/admin/dashboard");
        setData(res.data.data);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
      </div>
    );
  }

  if (loadingDashboard || !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
      </div>
    );
  }

  const { overview, recentUsers, recentClubs, clubsByCategory, monthlyRegistrations } = data;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            System overview, user and club activity, and registration trends.
          </p>
        </div>
      </header>

      <section aria-label="Overview statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={overview.totalUsers} />
        <StatCard label="Total Clubs" value={overview.totalClubs} />
        <StatCard label="Active Clubs" value={overview.activeClubs} />
        <StatCard label="Upcoming Events" value={overview.upcomingEvents} />
        <StatCard label="Total Events" value={overview.totalEvents} />
        <StatCard label="Approved Memberships" value={overview.totalMemberships} />
        <StatCard label="Pending Memberships" value={overview.pendingMemberships} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="text-xs text-gray-500">No users yet.</p>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{u.email}</td>
                    <td className="py-2 pr-4 text-gray-600">{u.role}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Clubs</h2>
          {recentClubs.length === 0 ? (
            <p className="text-xs text-gray-500">No clubs yet.</p>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Members</th>
                </tr>
              </thead>
              <tbody>
                {recentClubs.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">{c.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{c.category}</td>
                    <td className="py-2 pr-4 text-gray-600">{c.status}</td>
                    <td className="py-2 text-gray-500">{c._count.memberships}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Clubs by Category</h2>
          {clubsByCategory.length === 0 ? (
            <p className="text-xs text-gray-500">No category data yet.</p>
          ) : (
            <ul className="space-y-2 text-xs text-gray-700">
              {clubsByCategory.map((c) => (
                <li key={c.category} className="flex items-center justify-between">
                  <span>{c.category}</span>
                  <span className="font-semibold">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Monthly Registrations</h2>
          {Object.keys(monthlyRegistrations).length === 0 ? (
            <p className="text-xs text-gray-500">No registration data for the last 6 months.</p>
          ) : (
            <ul className="space-y-2 text-xs text-gray-700">
              {Object.entries(monthlyRegistrations)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, count]) => (
                  <li key={month} className="flex items-center justify-between">
                    <span>{month}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}





"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface ClubRow {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ClubStatus;
  createdAt: string;
  _count: {
    memberships: number;
    events: number;
  };
}

interface ClubsResponse {
  success: boolean;
  data: ClubRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminClubsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ClubStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loadingClubs, setLoadingClubs] = useState(true);

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

  const fetchClubs = async (pageToLoad = 1) => {
    setLoadingClubs(true);
    try {
      const res = await api.get<ClubsResponse>("/clubs", {
        params: {
          page: pageToLoad,
          search: search || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          limit: 20,
        },
      });
      setClubs(res.data.data);
      setPage(pageToLoad);
    } finally {
      setLoadingClubs(false);
    }
  };

  useEffect(() => {
    fetchClubs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClubs(1);
  };

  const handleStatusChange = async (id: string, newStatus: ClubStatus) => {
    await api.patch(`/clubs/${id}/status`, { status: newStatus });
    fetchClubs(page);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this club? This action cannot be undone.")) return;
    await api.delete(`/clubs/${id}`);
    fetchClubs(page);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Club Management</h1>
          <p className="text-sm text-gray-600">
            View all clubs, update status, or remove clubs from the system.
          </p>
        </div>
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2"
          aria-label="Filter clubs"
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ClubStatus | "ALL")}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description"
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Apply
          </button>
        </form>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loadingClubs ? (
          <div className="flex items-center justify-center min-h-[150px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" aria-label="Loading" />
          </div>
        ) : clubs.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No clubs found.</p>
        ) : (
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Members</th>
                <th className="py-2 px-3">Events</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="py-2 px-3 text-gray-900">{c.name}</td>
                  <td className="py-2 px-3 text-gray-600">{c.category}</td>
                  <td className="py-2 px-3 text-gray-600">{c._count.memberships}</td>
                  <td className="py-2 px-3 text-gray-600">{c._count.events}</td>
                  <td className="py-2 px-3">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value as ClubStatus)}
                      className="border border-gray-300 rounded-md text-xs px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      aria-label="Change club status"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </td>
                  <td className="py-2 px-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}





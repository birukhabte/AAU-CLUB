"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

type Role = "ADMIN" | "CLUB_LEADER" | "MEMBER";

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  _count: { memberships: number };
}

interface UsersResponse {
  success: boolean;
  data: UserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

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

  const fetchUsers = async (pageToLoad = 1) => {
    setLoadingUsers(true);
    try {
      const res = await api.get<UsersResponse>("/users", {
        params: {
          page: pageToLoad,
          role: roleFilter !== "ALL" ? roleFilter : undefined,
          search: search || undefined,
        },
      });
      setUsers(res.data.data);
      setPage(pageToLoad);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleChange = async (id: string, newRole: Role) => {
    await api.patch(`/users/${id}/role`, { role: newRole });
    fetchUsers(page);
  };

  const handleToggleStatus = async (id: string) => {
    await api.patch(`/users/${id}/toggle-status`);
    fetchUsers(page);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">
            Manage users, roles, and active status.
          </p>
        </div>
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2"
          aria-label="Filter users"
        >
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CLUB_LEADER">Club Leaders</option>
            <option value="MEMBER">Members</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
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
        {loadingUsers ? (
          <div className="flex items-center justify-center min-h-[150px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" aria-label="Loading" />
          </div>
        ) : users.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No users found.</p>
        ) : (
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Memberships</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="py-2 px-3 text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{u.email}</td>
                  <td className="py-2 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="border border-gray-300 rounded-md text-xs px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      aria-label="Change user role"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="CLUB_LEADER">CLUB_LEADER</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600">{u._count.memberships}</td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u.id)}
                      className="text-xs text-indigo-700 hover:text-indigo-900"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
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






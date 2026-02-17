"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { User, Mail, Phone, Shield, Users, Loader2, Search } from "lucide-react";

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
  const [totalUsers, setTotalUsers] = useState(0);
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
      setTotalUsers(res.data.pagination.total);
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
        <Loader2 className="w-10 h-10 animate-spin text-[rgb(2_116_181)]" />
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleChange = async (id: string, newRole: Role) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      fetchUsers(page);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update user role");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      fetchUsers(page);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      alert("Failed to update user status");
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CLUB_LEADER":
        return "bg-[rgb(2_116_181_/_10%)] text-[rgb(2_116_181)] border-[rgb(2_116_181_/_20%)]";
      case "MEMBER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-3 h-3" />;
      case "CLUB_LEADER":
        return <Users className="w-3 h-3" />;
      case "MEMBER":
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all users, their roles, and account status ({totalUsers} total users)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or student ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(2_116_181_/_50%)] focus:border-[rgb(2_116_181)]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
              className="border border-gray-300 rounded-lg text-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[rgb(2_116_181_/_50%)] focus:border-[rgb(2_116_181)]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="CLUB_LEADER">Club Leaders</option>
              <option value="MEMBER">Members</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-[rgb(2_116_181)] rounded-lg hover:bg-[rgb(2_116_181_/_80%)] transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loadingUsers ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(2_116_181)]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Found</h3>
            <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memberships
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {u.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={u.avatar}
                              alt={`${u.firstName} ${u.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[rgb(2_116_181_/_10%)] flex items-center justify-center">
                              <User className="h-5 w-5 text-[rgb(2_116_181)]" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                          {u.studentId && (
                            <div className="text-xs text-gray-500">
                              ID: {u.studentId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {u.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getRoleBadgeColor(
                          u.role
                        )} focus:outline-none focus:ring-2 focus:ring-[rgb(2_116_181_/_50%)]`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="CLUB_LEADER">CLUB_LEADER</option>
                        <option value="MEMBER">MEMBER</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${u.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {u._count.memberships}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className={`font-medium ${u.isActive
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                          }`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


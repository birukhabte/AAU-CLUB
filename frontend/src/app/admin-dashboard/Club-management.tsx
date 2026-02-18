"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import {
    Search,
    Plus,
    Trash2,
    Edit3,
    Users,
    CalendarDays,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ClubStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface Club {
    id: string;
    name: string;
    description: string;
    category: string;
    logo?: string;
    coverImage?: string;
    status: ClubStatus;
    meetingDay?: string;
    meetingTime?: string;
    location?: string;
    leaderId: string;
    createdAt: string;
    updatedAt: string;
    leader?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    _count: {
        memberships: number;
        events: number;
    };
}

interface ClubsResponse {
    success: boolean;
    data: Club[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface CreateClubForm {
    name: string;
    description: string;
    category: string;
    meetingDay: string;
    meetingTime: string;
    location: string;
}

/* ------------------------------------------------------------------ */
/*  Status badge helper                                                */
/* ------------------------------------------------------------------ */

const statusConfig: Record<ClubStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    ACTIVE: {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    INACTIVE: {
        bg: "bg-gray-50 border-gray-200",
        text: "text-gray-600",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    SUSPENDED: {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
};

/* ------------------------------------------------------------------ */
/*  Category options                                                   */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
    "Academic",
    "Arts & Culture",
    "Community Service",
    "Engineering",
    "Health & Wellness",
    "Media & Publications",
    "Music & Performance",
    "Professional Development",
    "Religious",
    "Science & Technology",
    "Social",
    "Sports & Recreation",
    "Other",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ClubManagement() {
    /* State --------------------------------------------------------- */
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ClubStatus | "ALL">("ALL");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [formData, setFormData] = useState<CreateClubForm>({
        name: "",
        description: "",
        category: "",
        meetingDay: "",
        meetingTime: "",
        location: "",
    });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    /* Fetch clubs --------------------------------------------------- */
    const fetchClubs = useCallback(
        async (pageToLoad = 1) => {
            setLoading(true);
            try {
                const res = await api.get<ClubsResponse>("/clubs", {
                    params: {
                        page: pageToLoad,
                        limit: 10,
                        search: search || undefined,
                        status: statusFilter !== "ALL" ? statusFilter : undefined,
                        category: categoryFilter || undefined,
                    },
                });
                setClubs(res.data.data);
                setPage(res.data.pagination.page);
                setTotalPages(res.data.pagination.pages);
                setTotal(res.data.pagination.total);
            } catch {
                console.error("Failed to fetch clubs");
            } finally {
                setLoading(false);
            }
        },
        [search, statusFilter, categoryFilter]
    );

    useEffect(() => {
        fetchClubs(1);
    }, [fetchClubs]);

    /* Handlers ------------------------------------------------------ */
    const handleStatusChange = async (id: string, newStatus: ClubStatus) => {
        setActionLoading(id);
        try {
            await api.patch(`/clubs/${id}/status`, { status: newStatus });
            await fetchClubs(page);
        } catch {
            console.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this club? This cannot be undone."))
            return;
        setActionLoading(id);
        try {
            await api.delete(`/clubs/${id}`);
            await fetchClubs(page);
        } catch {
            console.error("Failed to delete club");
        } finally {
            setActionLoading(null);
        }
    };

    const openCreateModal = () => {
        setFormData({
            name: "",
            description: "",
            category: "",
            meetingDay: "",
            meetingTime: "",
            location: "",
        });
        setFormError("");
        setShowCreateModal(true);
    };

    const openEditModal = (club: Club) => {
        setEditingClub(club);
        setFormData({
            name: club.name,
            description: club.description,
            category: club.category,
            meetingDay: club.meetingDay || "",
            meetingTime: club.meetingTime || "",
            location: club.location || "",
        });
        setFormError("");
        setShowEditModal(true);
    };

    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.category) {
            setFormError("Name, description, and category are required.");
            return;
        }
        setSaving(true);
        setFormError("");
        try {
            await api.post("/clubs", formData);
            setShowCreateModal(false);
            await fetchClubs(1);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setFormError(error?.response?.data?.message || "Failed to create club.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClub) return;
        if (!formData.name || !formData.description || !formData.category) {
            setFormError("Name, description, and category are required.");
            return;
        }
        setSaving(true);
        setFormError("");
        try {
            await api.put(`/clubs/${editingClub.id}`, formData);
            setShowEditModal(false);
            setEditingClub(null);
            await fetchClubs(page);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setFormError(error?.response?.data?.message || "Failed to update club.");
        } finally {
            setSaving(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchClubs(1);
    };

    /* UI ------------------------------------------------------------ */
    return (
        <div className="space-y-6">
            {/* ---- Page Header ---- */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Club Management
                    </h1>
                    <p className="text-sm text-gray-700 mt-1">
                        Create, update, activate or deactivate clubs across the platform.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Club
                </button>
            </div>

            {/* ---- Stats Summary ---- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Total Clubs
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                        Active
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                        {clubs.filter((c) => c.status === "ACTIVE").length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Inactive
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-600">
                        {clubs.filter((c) => c.status === "INACTIVE").length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4">
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                        Suspended
                    </p>
                    <p className="mt-1 text-2xl font-bold text-amber-700">
                        {clubs.filter((c) => c.status === "SUSPENDED").length}
                    </p>
                </div>
            </div>

            {/* ---- Filters Bar ---- */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search clubs by name or description…"
                            className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-600 hidden sm:block" />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as ClubStatus | "ALL")
                            }
                            className="border border-gray-200 rounded-lg text-sm text-gray-900 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>

                    {/* Category filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg text-sm text-gray-900 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* ---- Table ---- */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                        <Search className="w-10 h-10 mb-3" />
                        <p className="text-sm">No clubs found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Club
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" /> Members
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5" /> Events
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Leader
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clubs.map((club) => {
                                    const cfg = statusConfig[club.status];
                                    const isActionLoading = actionLoading === club.id;

                                    return (
                                        <tr
                                            key={club.id}
                                            className="hover:bg-gray-50/60 transition-colors"
                                        >
                                            {/* Club name + description */}
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {club.name}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {club.description}
                                                </p>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full">
                                                    {club.category}
                                                </span>
                                            </td>

                                            {/* Members */}
                                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                                                {club._count.memberships}
                                            </td>

                                            {/* Events */}
                                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                                                {club._count.events}
                                            </td>

                                            {/* Leader */}
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {club.leader
                                                    ? `${club.leader.firstName} ${club.leader.lastName}`
                                                    : "—"}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={club.status}
                                                    disabled={isActionLoading}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            club.id,
                                                            e.target.value as ClubStatus
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${cfg.bg} ${cfg.text} cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                    <option value="SUSPENDED">Suspended</option>
                                                </select>
                                            </td>

                                            {/* Created */}
                                            <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                                                {new Date(club.createdAt).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(club)}
                                                        disabled={isActionLoading}
                                                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                        title="Edit club"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(club.id)}
                                                        disabled={isActionLoading}
                                                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete club"
                                                    >
                                                        {isActionLoading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-700">
                            Page {page} of {totalPages} &middot; {total} clubs total
                        </p>
                        <div className="inline-flex items-center gap-1">
                            <button
                                onClick={() => fetchClubs(page - 1)}
                                disabled={page <= 1}
                                className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-40 rounded-md"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => fetchClubs(page + 1)}
                                disabled={page >= totalPages}
                                className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-40 rounded-md"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ================================================================ */}
            {/*  CREATE MODAL                                                    */}
            {/* ================================================================ */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Create New Club</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleCreateClub} className="px-6 py-5 space-y-4">
                            {formError && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Club Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g. AAU Coding Club"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                    placeholder="A brief description of the club…"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select…</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({ ...formData, location: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. Room 204"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meeting Day
                                    </label>
                                    <select
                                        value={formData.meetingDay}
                                        onChange={(e) =>
                                            setFormData({ ...formData, meetingDay: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select…</option>
                                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                                            (d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meeting Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.meetingTime}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                meetingTime: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Club
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/*  EDIT MODAL                                                      */}
            {/* ================================================================ */}
            {showEditModal && editingClub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                Edit Club — {editingClub.name}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingClub(null);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleUpdateClub} className="px-6 py-5 space-y-4">
                            {formError && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Club Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select…</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({ ...formData, location: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meeting Day
                                    </label>
                                    <select
                                        value={formData.meetingDay}
                                        onChange={(e) =>
                                            setFormData({ ...formData, meetingDay: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select…</option>
                                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                                            (d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meeting Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.meetingTime}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                meetingTime: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingClub(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
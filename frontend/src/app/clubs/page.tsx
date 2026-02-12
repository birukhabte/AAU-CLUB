"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Users, Calendar, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import type { Club } from "@/types";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ClubsDirectoryPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setIsLoading(true);
        const [clubsRes, categoriesRes] = await Promise.all([
          api.get<PaginatedResponse<Club>>("/clubs", {
            params: { page, search: search || undefined, category },
          }),
          api.get<{ success: boolean; data: string[] }>("/clubs/categories"),
        ]);
        setClubs(clubsRes.data.data);
        setCategories(categoriesRes.data.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, [page, search, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center justify-center font-bold text-2xl text-indigo-600" href="/">
          AAU Clubs
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700" href="/login">
            Sign In
          </Link>
          <Link
            className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            href="/register"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Club Directory</h1>
            <p className="text-sm text-gray-600">
              Browse all active AAU clubs. Filter by category or search by name.
            </p>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-1 md:flex-none items-center gap-2"
            role="search"
            aria-label="Search clubs"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by club name or description"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <select
                value={category || ""}
                onChange={(e) => setCategory(e.target.value || undefined)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading clubs">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : clubs.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No clubs found. Try adjusting your filters.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <article
                key={club.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{club.name}</h2>
                    {club.logo && (
                      <img
                        src={club.logo}
                        alt={`${club.name} logo`}
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-indigo-600 uppercase tracking-wide">{club.category}</p>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">{club.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      {club.membersCount ?? 0} members
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      Active
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    aria-label={`View details for ${club.name}`}
                  >
                    View Club
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}






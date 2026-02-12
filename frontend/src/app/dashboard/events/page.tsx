"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { CalendarDays, Clock, MapPin } from "lucide-react";

interface RSVPEvent {
  id: string;
  status: string;
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    club: {
      id: string;
      name: string;
      logo?: string | null;
    };
  };
}

interface RSVPsResponse {
  success: boolean;
  data: RSVPEvent[];
}

export default function EventsPage() {
  const [rsvps, setRsvps] = useState<RSVPEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<RSVPsResponse>("/events/user/rsvps");
        setRsvps(data.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRSVPs();
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, RSVPEvent[]> = {};
    rsvps.forEach((rsvp) => {
      const day = new Date(rsvp.event.date).toISOString().slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(rsvp);
    });
    return map;
  }, [rsvps]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = Array.from({ length: startDay + daysInMonth }, (_, index) => {
    if (index < startDay) return null;
    const dayOfMonth = index - startDay + 1;
    const dateKey = new Date(year, month, dayOfMonth).toISOString().slice(0, 10);
    return {
      dayOfMonth,
      dateKey,
      hasEvent: !!eventsByDate[dateKey],
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-600">
            View events you&apos;ve RSVP&apos;d to in a list or calendar view.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Select events view mode"
          className="inline-flex rounded-md border border-gray-200 bg-white shadow-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={`px-3 py-1.5 text-sm font-medium rounded-l-md ${
              view === "list" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "calendar"}
            className={`px-3 py-1.5 text-sm font-medium rounded-r-md border-l border-gray-200 ${
              view === "calendar" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
        </div>
      ) : rsvps.length === 0 ? (
        <p className="text-sm text-gray-500">You haven&apos;t RSVP&apos;d to any events yet.</p>
      ) : view === "list" ? (
        <section aria-label="Events list" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <ul className="divide-y divide-gray-100">
            {rsvps.map((rsvp) => (
              <li key={rsvp.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  {rsvp.event.club.logo && (
                    <img
                      src={rsvp.event.club.logo}
                      alt={`${rsvp.event.club.name} logo`}
                      className="h-10 w-10 rounded-full object-cover mt-1"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{rsvp.event.title}</p>
                    <p className="text-xs text-indigo-700 font-medium">{rsvp.event.club.name}</p>
                    <p className="mt-1 text-xs text-gray-600">{rsvp.event.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {new Date(rsvp.event.date).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {rsvp.event.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {rsvp.event.location}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {rsvp.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-label="Events calendar" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">
              {today.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-gray-500">Days with events are highlighted.</p>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center py-1 font-medium">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm" role="grid">
            {calendarCells.map((cell, index) =>
              !cell ? (
                <div key={index} role="gridcell" aria-hidden="true" />
              ) : (
                <button
                  key={cell.dateKey}
                  type="button"
                  role="gridcell"
                  aria-label={
                    cell.hasEvent
                      ? `${cell.dayOfMonth}, has ${eventsByDate[cell.dateKey].length} events`
                      : `${cell.dayOfMonth}, no events`
                  }
                  className={`h-16 flex flex-col items-center justify-start rounded-md border text-xs ${
                    cell.hasEvent
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <span className="mt-1">{cell.dayOfMonth}</span>
                  {cell.hasEvent && (
                    <span className="mt-1 px-1 rounded-full bg-indigo-600 text-white text-[10px]">
                      {eventsByDate[cell.dateKey].length} event
                      {eventsByDate[cell.dateKey].length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}







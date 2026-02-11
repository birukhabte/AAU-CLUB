"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Bell, Trash2, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchNotifications = async (pageToLoad = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<NotificationsResponse>("/notifications", {
        params: { page: pageToLoad, limit: 20 },
      });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
      setPage(pageToLoad);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleMarkAllAsRead = async () => {
    await api.patch("/notifications/mark-all-read");
    fetchNotifications(page);
  };

  const handleMarkAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications(page);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    fetchNotifications(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600">
              Stay up to date with club announcements, membership changes, and event reminders.
            </p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-label="Loading" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-gray-500">You have no notifications yet.</p>
      ) : (
        <section
          aria-label="Notifications list"
          className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100"
        >
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`p-4 flex items-start gap-3 ${
                notification.isRead ? "bg-white" : "bg-indigo-50"
              }`}
              aria-live="polite"
            >
              <div className="mt-1">
                <span
                  className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                    notification.isRead ? "bg-gray-200 text-gray-700" : "bg-indigo-600 text-white"
                  }`}
                  aria-hidden="true"
                >
                  {notification.title.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">{notification.title}</h2>
                <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()} · {notification.type}
                </p>
                {notification.link && (
                  <a
                    href={notification.link}
                    className="mt-2 inline-flex text-xs font-medium text-indigo-700 hover:text-indigo-800 underline underline-offset-2"
                  >
                    View details
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs text-indigo-700 hover:text-indigo-900"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(notification.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="text-xs text-gray-500" aria-live="polite">
        Unread: {unreadCount}
      </p>
    </div>
  );
}





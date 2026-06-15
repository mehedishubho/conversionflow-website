"use client";

import { useState, useEffect } from "react";
import {
  Key,
  CreditCard,
  MessageSquare,
  Info,
  CheckCheck,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/(portal)/actions/notifications";
import { formatDistanceToNow } from "date-fns";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: Date;
};

function getNotificationIcon(type: string) {
  switch (type) {
    case "license":
      return {
        icon: <Key className="w-5 h-5" />,
        bg: "bg-brand-50 dark:bg-brand-500/15",
        color: "text-brand-500 dark:text-brand-400",
      };
    case "billing":
      return {
        icon: <CreditCard className="w-5 h-5" />,
        bg: "bg-success-50 dark:bg-success-500/15",
        color: "text-success-600 dark:text-success-500",
      };
    case "support":
      return {
        icon: <MessageSquare className="w-5 h-5" />,
        bg: "bg-warning-50 dark:bg-warning-500/15",
        color: "text-warning-600 dark:text-warning-500",
      };
    default:
      return {
        icon: <Info className="w-5 h-5" />,
        bg: "bg-error-50 dark:bg-error-500/15",
        color: "text-error-600 dark:text-error-500",
      };
  }
}

export function CustomerNotificationsList() {
  const [notificationList, setNotificationList] = useState<NotificationItem[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load current notifications on mount (matches NotificationPreferences pattern)
  useEffect(() => {
    async function loadNotifications() {
      try {
        const result = await getNotifications();
        setNotificationList(
          result.notifications as unknown as NotificationItem[]
        );
        setUnreadCount(result.unreadCount);
      } catch {
        // Silently handle errors - show empty state
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, []);

  async function handleClickNotification(
    notificationId: string,
    entityUrl?: string
  ) {
    // Optimistic update
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotificationList((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );

    try {
      await markNotificationRead(notificationId);
    } catch {
      // Revert on failure
      setUnreadCount((prev) => prev + 1);
      setNotificationList((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: false } : n
        )
      );
      return;
    }

    if (entityUrl) {
      window.location.assign(entityUrl);
    }
  }

  async function handleMarkAllRead() {
    // Optimistic update
    const previousList = notificationList;
    const previousCount = unreadCount;
    setUnreadCount(0);
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllNotificationsRead();
    } catch {
      // Revert on failure
      setUnreadCount(previousCount);
      setNotificationList(previousList);
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Header row with mark-all-read */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      {notificationList.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          You&apos;re all caught up! No notifications.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notificationList.map((notification) => {
            const iconInfo = getNotificationIcon(notification.type);
            return (
              <li key={notification.id}>
                <div
                  className={`flex gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors ${
                    !notification.read ? "border-l-2 border-l-brand-500" : ""
                  }`}
                  onClick={() =>
                    handleClickNotification(
                      notification.id,
                      (
                        notification.data as Record<string, string> | null
                      )?.entityUrl
                    )
                  }
                >
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${iconInfo.bg}`}
                  >
                    <span className={iconInfo.color}>
                      {iconInfo.icon}
                    </span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      <span className="capitalize">{notification.type}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span>
                        {formatDistanceToNow(
                          new Date(notification.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Key, CreditCard, MessageSquare, Info } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Link from "next/link";
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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleClickNotification(
    notificationId: string,
    entityUrl?: string
  ) {
    await markNotificationRead(notificationId);

    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotificationList((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );

    if (entityUrl) {
      window.location.href = entityUrl;
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping" />
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-brand-500 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500">
              Loading...
            </li>
          ) : notificationList.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500">
              You&apos;re all caught up! No new notifications.
            </li>
          ) : (
            notificationList.map((notification) => {
              const iconInfo = getNotificationIcon(notification.type);
              return (
                <li key={notification.id}>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  >
                    <div
                      className={`flex gap-3 w-full cursor-pointer ${
                        !notification.read
                          ? "border-l-2 border-l-brand-500"
                          : ""
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
                        {React.cloneElement(iconInfo.icon, {
                          className: `w-5 h-5 ${iconInfo.color}`,
                        })}
                      </span>
                      <span className="block">
                        <span className="block text-theme-sm font-bold text-gray-800 dark:text-white/90">
                          {notification.title}
                        </span>
                        <span className="block text-theme-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </span>
                        <span className="flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="capitalize">
                            {notification.type}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full" />
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </span>
                      </span>
                    </div>
                  </DropdownItem>
                </li>
              );
            })
          )}
        </ul>
        <Link
          href="/dashboard/account"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}

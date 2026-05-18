import React from "react";
import {
  ShoppingCart,
  Key,
  UserPlus,
  MessageSquare,
  ShieldBan,
  UserCog,
  RotateCcw,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface AuditEvent {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

type ActionConfig = {
  description: (details: Record<string, unknown> | null) => string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
};

const actionConfig: Record<string, ActionConfig> = {
  "order.created": {
    description: () => "New order placed",
    icon: ShoppingCart,
    iconColor: "text-brand-500",
    iconBg: "bg-brand-50 dark:bg-brand-500/15",
  },
  "order.status_changed": {
    description: (d) => {
      const to = d?.to as string;
      if (to === "completed") return "Order verified and confirmed";
      if (to === "refunded") return "Order refunded";
      if (to === "failed") return "Order marked as failed";
      return "Order status updated";
    },
    icon: RotateCcw,
    iconColor: "text-success-600",
    iconBg: "bg-success-50 dark:bg-success-500/15",
  },
  "order.rejected": {
    description: () => "Order rejected",
    icon: ShoppingCart,
    iconColor: "text-error-600",
    iconBg: "bg-error-50 dark:bg-error-500/15",
  },
  "order.refunded": {
    description: () => "Order refunded",
    icon: RotateCcw,
    iconColor: "text-error-600",
    iconBg: "bg-error-50 dark:bg-error-500/15",
  },
  "license.created": {
    description: () => "License key generated",
    icon: Key,
    iconColor: "text-brand-500",
    iconBg: "bg-brand-50 dark:bg-brand-500/15",
  },
  "user.registered": {
    description: () => "New user signed up",
    icon: UserPlus,
    iconColor: "text-success-600",
    iconBg: "bg-success-50 dark:bg-success-500/15",
  },
  "user.banned": {
    description: (d) => {
      const reason = d?.reason as string;
      return reason ? `User banned: ${reason}` : "User banned";
    },
    icon: ShieldBan,
    iconColor: "text-error-600",
    iconBg: "bg-error-50 dark:bg-error-500/15",
  },
  "user.activated": {
    description: () => "User account reactivated",
    icon: UserCog,
    iconColor: "text-success-600",
    iconBg: "bg-success-50 dark:bg-success-500/15",
  },
  "user.role_changed": {
    description: (d) => {
      const to = d?.to as string;
      return to ? `Role changed to ${to}` : "User role updated";
    },
    icon: UserCog,
    iconColor: "text-blue-light-500",
    iconBg: "bg-blue-light-50 dark:bg-blue-light-500/15",
  },
  "ticket.created": {
    description: () => "Support ticket opened",
    icon: MessageSquare,
    iconColor: "text-warning-600",
    iconBg: "bg-warning-50 dark:bg-warning-500/15",
  },
};

const defaultConfig: ActionConfig = {
  description: () => "System event",
  icon: Info,
  iconColor: "text-gray-500",
  iconBg: "bg-gray-100 dark:bg-gray-800",
};

export function getActionConfig(action: string): ActionConfig {
  return actionConfig[action] ?? defaultConfig;
}

interface ActivityFeedProps {
  events: AuditEvent[];
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No activity recorded</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          System events will appear here as they occur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const config = getActionConfig(event.action);
        const Icon = config.icon;
        return (
          <div key={event.id} className="flex items-start gap-3">
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${config.iconBg}`}
            >
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 dark:text-white/90">
                {config.description(event.details)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(event.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

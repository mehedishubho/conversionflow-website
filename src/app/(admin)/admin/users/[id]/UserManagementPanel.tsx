"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import { updateUserRole, banUser, unbanUser } from "../actions";

interface UserManagementPanelProps {
  userId: string;
  currentRole: string;
  isBanned: boolean;
}

const ROLES = [
  { value: "customer", label: "Customer" },
  { value: "support_staff", label: "Support Staff" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export default function UserManagementPanel({
  userId,
  currentRole,
  isBanned,
}: UserManagementPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Role change state
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [roleMessage, setRoleMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ban state
  const [banReason, setBanReason] = useState("");
  const [banMessage, setBanMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleRoleChange() {
    if (selectedRole === currentRole) return;
    setRoleMessage(null);

    startTransition(async () => {
      const result = await updateUserRole(userId, selectedRole);
      if (result.error) {
        setRoleMessage({ type: "error", text: result.error });
      } else {
        setRoleMessage({ type: "success", text: `Role updated to ${selectedRole}` });
        router.refresh();
      }
    });
  }

  function handleBan() {
    setBanMessage(null);

    startTransition(async () => {
      const result = await banUser(userId, banReason);
      if (result.error) {
        setBanMessage({ type: "error", text: result.error });
      } else {
        setBanMessage({ type: "success", text: "User has been banned." });
        setBanReason("");
        router.refresh();
      }
    });
  }

  function handleUnban() {
    setBanMessage(null);

    startTransition(async () => {
      const result = await unbanUser(userId);
      if (result.error) {
        setBanMessage({ type: "error", text: result.error });
      } else {
        setBanMessage({ type: "success", text: "User has been unbanned." });
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Role Management */}
      <ComponentCard title="Role Management" desc="Change this user's access level.">
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Role
            </label>
            <div className="flex items-center gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => setSelectedRole(role.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                    selectedRole === role.value
                      ? "bg-accent text-white border-accent"
                      : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accent/50"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {roleMessage && (
            <div
              className={`p-3 text-sm rounded-lg border ${
                roleMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}
            >
              {roleMessage.text}
            </div>
          )}

          <button
            type="button"
            onClick={handleRoleChange}
            disabled={isPending || selectedRole === currentRole}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Updating..." : "Update Role"}
          </button>
        </div>
      </ComponentCard>

      {/* Ban Management */}
      <ComponentCard
        title={isBanned ? "Unban User" : "Ban User"}
        desc={isBanned ? "Restore this user's access." : "Restrict this user from accessing the platform."}
      >
        <div className="space-y-4">
          {banMessage && (
            <div
              className={`p-3 text-sm rounded-lg border ${
                banMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}
            >
              {banMessage.text}
            </div>
          )}

          {isBanned ? (
            <button
              type="button"
              onClick={handleUnban}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Unbanning..." : "Unban User"}
            </button>
          ) : (
            <>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ban Reason
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for banning this user (optional)"
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-lg bg-surface border border-border2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleBan}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Banning..." : "Ban User"}
              </button>
            </>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}

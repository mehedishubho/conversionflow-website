"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import TextArea from "@/components/form/input/TextArea";
import { changeUserRole, toggleUserBan } from "@/app/(admin)/actions/admin-users";

const roleOptions = [
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
  { value: "support_staff", label: "Support Staff" },
  { value: "super_admin", label: "Super Admin" },
];

interface UserDetailClientProps {
  userId: string;
  userName: string;
  currentRole: string;
  isBanned: boolean;
  banReason: string | null;
}

export default function UserDetailClient({
  userId,
  userName,
  currentRole,
  isBanned,
  banReason,
}: UserDetailClientProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "role" | "ban" | "activate";
  } | null>(null);

  const handleRoleChange = () => {
    setError(null);
    startTransition(async () => {
      const result = await changeUserRole(userId, selectedRole);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmModal(null);
        router.refresh();
      }
    });
  };

  const handleBan = () => {
    if (!banReasonInput.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await toggleUserBan(userId, true, banReasonInput);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmModal(null);
        setBanReasonInput("");
        router.refresh();
      }
    });
  };

  const handleActivate = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleUserBan(userId, false);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmModal(null);
        router.refresh();
      }
    });
  };

  return (
    <ComponentCard title="Actions" desc="Manage user role and account status.">
      {error && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm mb-4 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Role
        </label>
        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              if (selectedRole !== currentRole) {
                setConfirmModal({ type: "role" });
              }
            }}
            disabled={isPending || selectedRole === currentRole}
          >
            Save Role
          </Button>
        </div>
      </div>

      <div>
        {isBanned ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400">
                Banned
              </span>
              {banReason && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Reason: {banReason}
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="!text-success-600 !ring-success-300 hover:!bg-success-50 dark:hover:!bg-success-500/10"
              onClick={() => setConfirmModal({ type: "activate" })}
              disabled={isPending}
            >
              Activate User
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={() => setConfirmModal({ type: "ban" })}
            disabled={isPending}
          >
            Ban User
          </Button>
        )}
      </div>

      <Modal
        isOpen={confirmModal?.type === "role"}
        onClose={() => setConfirmModal(null)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Change role?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Change {userName}&apos;s role from <strong>{currentRole}</strong> to <strong>{selectedRole}</strong>?
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmModal(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRoleChange} disabled={isPending}>
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal?.type === "ban"}
        onClose={() => {
          setConfirmModal(null);
          setBanReasonInput("");
        }}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Ban {userName}?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will prevent the user from accessing their account.
        </p>
        <TextArea
          placeholder="Reason for ban (required)..."
          rows={3}
          value={banReasonInput}
          onChange={setBanReasonInput}
        />
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfirmModal(null);
              setBanReasonInput("");
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={handleBan}
            disabled={isPending || !banReasonInput.trim()}
          >
            Ban User
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal?.type === "activate"}
        onClose={() => setConfirmModal(null)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Reactivate {userName}?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will restore the user&apos;s access to their account.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmModal(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleActivate} disabled={isPending}>
            Activate
          </Button>
        </div>
      </Modal>
    </ComponentCard>
  );
}

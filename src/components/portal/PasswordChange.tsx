"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }
    if (!newPassword || newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validate()) return;

    setIsPending(true);

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        setError(
          result.error.message || "Failed to update password. Please try again."
        );
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setValidationErrors({});
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (validationErrors.currentPassword) {
                setValidationErrors((prev) => ({
                  ...prev,
                  currentPassword: "",
                }));
              }
            }}
            placeholder="Enter current password"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {validationErrors.currentPassword && (
            <p className="mt-1 text-xs text-error-600 dark:text-error-500">
              {validationErrors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (validationErrors.newPassword) {
                setValidationErrors((prev) => ({ ...prev, newPassword: "" }));
              }
            }}
            placeholder="Enter new password"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {validationErrors.newPassword && (
            <p className="mt-1 text-xs text-error-600 dark:text-error-500">
              {validationErrors.newPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationErrors.confirmPassword) {
                setValidationErrors((prev) => ({
                  ...prev,
                  confirmPassword: "",
                }));
              }
            }}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-xs text-error-600 dark:text-error-500">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        You must enter your current password to set a new one.
      </p>

      {error && (
        <p className="mt-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 text-sm text-success-600 dark:text-success-500">
          Password updated successfully
        </p>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}

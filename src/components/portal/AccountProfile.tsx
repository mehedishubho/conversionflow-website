"use client";

import { useState } from "react";
import { updateProfile } from "@/app/(portal)/actions/account";
import { useRouter } from "next/navigation";

interface AccountProfileProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
}

export function AccountProfile({
  initialName,
  initialEmail,
  initialPhone,
}: AccountProfileProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("phone", phone);

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Display Name
          </label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email
          </label>
          <div className="relative">
            <input
              value={initialEmail}
              disabled
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              title="Email cannot be changed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 11H5M14 2H10C7.172 2 5.757 2 4.879 2.879C4 3.757 4 5.172 4 8V16C4 18.828 4 20.243 4.879 21.121C5.757 22 7.172 22 10 22H14C16.828 22 18.243 22 19.121 21.121C20 20.243 20 18.828 20 16V8C20 5.172 20 3.757 19.121 2.879C18.683 2.44 18.087 2.205 17.25 2.088M14 2V4M10 2V4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Phone Number
          </label>
          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Your phone number"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 text-sm text-success-600 dark:text-success-500">
          Profile updated successfully
        </p>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
}

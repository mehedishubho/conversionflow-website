"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { completeSetup } from "./actions";

export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the user account via Better Auth
      // Phone passed via fetchOptions.body since Better Auth client types
      // don't include custom additionalFields (see Phase 01 decisions)
      const result = await signUp.email({
        email,
        password,
        name,
        fetchOptions: {
          body: {
            phone: "+880000000000", // Placeholder -- admin setup bypasses phone requirement
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // Step 2: Set role to super_admin via server action
      if (result.data?.user?.id) {
        const setupResult = await completeSetup(result.data.user.id);

        if (setupResult.error) {
          setError(setupResult.error);
          setLoading(false);
          return;
        }

        // Step 3: Redirect to admin dashboard
        router.push("/admin/dashboard");
      } else {
        setError("Account created but user ID not returned. Please log in manually.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-[--red-lt] text-[--red] text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-[--border2] bg-[--surface] text-[--foreground] focus:outline-none focus:border-[--accent] transition-colors"
          placeholder="Admin Name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-[--border2] bg-[--surface] text-[--foreground] focus:outline-none focus:border-[--accent] transition-colors"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 rounded-lg border border-[--border2] bg-[--surface] text-[--foreground] focus:outline-none focus:border-[--accent] transition-colors"
          placeholder="Minimum 8 characters"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 rounded-lg border border-[--border2] bg-[--surface] text-[--foreground] focus:outline-none focus:border-[--accent] transition-colors"
          placeholder="Repeat your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-primary btn-lg justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Admin Account..." : "Create Super Admin Account"}
      </button>
    </form>
  );
}

"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="mt-6 px-4 py-2 text-sm font-medium rounded-lg bg-red/10 text-red border border-red/20 hover:bg-red/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}

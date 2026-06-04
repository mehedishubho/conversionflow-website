"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-[100px] font-black leading-none tracking-tighter text-[var(--color-brand-200)]">
        404
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-[var(--color-gray-500)] max-w-md">
        The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-brand-500)] text-white text-sm font-semibold hover:bg-[var(--color-brand-600)] transition-colors"
        >
          <Home size={16} />
          Dashboard
        </Link>
        <button
          onClick={() => history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-gray-200)] text-sm font-semibold text-[var(--color-gray-700)] hover:bg-[var(--color-gray-50)] transition-colors"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Only admin, super_admin, and support_staff can access admin routes
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole !== "admin" &&
    userRole !== "super_admin" &&
    userRole !== "support_staff"
  ) {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-syne mb-2">Admin Overview</h1>
      <p className="text-text2">Welcome, {session.user.name || session.user.email}</p>
      <p className="text-sm text-muted mt-4">Admin features coming in Phase 5</p>
    </div>
  );
}

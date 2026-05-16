import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PortalDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Redirect admin roles to admin dashboard
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "support_staff"
  ) {
    redirect("/admin/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-syne mb-2">Dashboard</h1>
      <p className="text-text2">Welcome, {session.user.name || session.user.email}</p>
      <p className="text-sm text-muted mt-4">Portal features coming in Phase 3</p>
    </div>
  );
}

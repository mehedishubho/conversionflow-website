import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { downloads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DownloadsList } from "@/components/portal/DownloadsList";

export default async function DownloadsPage() {
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

  const userId = session.user.id;

  const userDownloads = await db
    .select()
    .from(downloads)
    .where(eq(downloads.userId, userId))
    .orderBy(desc(downloads.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Downloads" basePath="/dashboard" />
      <DownloadsList
        downloads={userDownloads}
        emptyMessage="No downloads available yet. Plugin versions will appear here when released."
      />
    </div>
  );
}

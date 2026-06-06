import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsShell } from "@/components/admin/SettingsShell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Centralized auth guard for all settings pages
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/dashboard");

  return <SettingsShell>{children}</SettingsShell>;
}

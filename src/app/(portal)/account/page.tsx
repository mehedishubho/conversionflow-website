import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { AccountProfile } from "@/components/portal/AccountProfile";
import { PasswordChange } from "@/components/portal/PasswordChange";
import { NotificationPreferences } from "@/components/portal/NotificationPreferences";

export default async function AccountPage() {
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

  const phone =
    (session.user as Record<string, unknown>).phone?.toString() || "";

  return (
    <div>
      <PageBreadcrumb pageTitle="Account" basePath="/dashboard" />

      <ComponentCard title="Profile">
        <AccountProfile
          initialName={session.user.name}
          initialEmail={session.user.email}
          initialPhone={phone}
        />
      </ComponentCard>

      <ComponentCard title="Change Password" className="mt-6">
        <PasswordChange />
      </ComponentCard>

      <ComponentCard title="Notification Preferences" className="mt-6">
        <NotificationPreferences />
      </ComponentCard>
    </div>
  );
}

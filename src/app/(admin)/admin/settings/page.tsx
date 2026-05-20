import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";
import { getPaymentSettings } from "@/app/(admin)/actions/admin-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Auth check + admin role check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/dashboard");
  }

  // Load current payment settings
  const settings = await getPaymentSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" basePath="/admin/dashboard" />

      <PaymentSettingsForm
        initialData={{
          paymentAccounts: settings.paymentAccounts.map((a) => ({
            id: a.id,
            method: a.method,
            accountName: a.accountName,
            accountNumber: a.accountNumber,
            bankName: a.bankName,
            branch: a.branch,
            routingNumber: a.routingNumber,
            instructions: a.instructions,
            active: a.active,
          })),
          vatRate: settings.vatRate,
          vatMode: settings.vatMode,
          vatEnabled: settings.vatEnabled,
          sslCommerzEnabled: settings.sslCommerzEnabled,
          sslCommerz: settings.sslCommerz,
          centralApi: settings.centralApi,
        }}
      />
    </div>
  );
}

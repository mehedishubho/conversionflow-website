import { getPaymentSettings } from "@/app/(admin)/actions/admin-settings";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const settings = await getPaymentSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Settings" basePath="/admin/settings" />
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
        }}
      />
    </div>
  );
}

import { getEmailProviderSettings } from "@/app/(admin)/actions/admin-notif-settings";
import EmailProviderSettings from "@/components/admin/EmailProviderSettings";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SmtpSettingsPage() {
  const emailSettings = await getEmailProviderSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="SMTP / Email Settings" basePath="/admin/settings" />
      <EmailProviderSettings initialData={emailSettings} />
    </div>
  );
}

import { getTransferSettings } from "@/app/(admin)/actions/admin-settings";
import TransferSettingsForm from "@/components/admin/TransferSettingsForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function TransferSettingsPage() {
  const settings = await getTransferSettings();

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Transfer Settings"
        basePath="/admin/settings"
      />
      <TransferSettingsForm
        initialData={{
          maxTransfersPerMonth: settings.maxTransfersPerMonth,
        }}
      />
    </div>
  );
}

import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import { META_PIXEL_KEYS } from "@/lib/tracking-keys";
import MetaPixelForm from "@/components/admin/seo/MetaPixelForm";

export const dynamic = "force-dynamic";

export default async function SeoMetaPixelPage() {
  const settings = await getTrackingSettings([...META_PIXEL_KEYS]);

  return <MetaPixelForm initialData={settings} />;
}

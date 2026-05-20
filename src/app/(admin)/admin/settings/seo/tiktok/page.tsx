import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import { TIKTOK_KEYS } from "@/lib/tracking-keys";
import TikTokForm from "@/components/admin/seo/TikTokForm";

export default async function SeoTiktokPage() {
  const settings = await getTrackingSettings([...TIKTOK_KEYS]);

  return <TikTokForm initialData={settings} />;
}

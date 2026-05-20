import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import { SOCIAL_KEYS } from "@/lib/tracking-keys";
import SocialForm from "@/components/admin/seo/SocialForm";

export const dynamic = "force-dynamic";

export default async function SeoSocialPage() {
  const settings = await getTrackingSettings([...SOCIAL_KEYS]);

  return <SocialForm initialData={settings} />;
}

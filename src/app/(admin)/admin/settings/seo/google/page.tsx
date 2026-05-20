import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import { GOOGLE_KEYS } from "@/lib/tracking-keys";
import GoogleTrackingForm from "@/components/admin/seo/GoogleTrackingForm";

export default async function SeoGooglePage() {
  const settings = await getTrackingSettings([...GOOGLE_KEYS]);

  return <GoogleTrackingForm initialData={settings} />;
}

import SchemaForm from "@/components/admin/seo/SchemaForm";
import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import { SCHEMA_KEYS } from "@/lib/tracking-keys";

export default async function SeoSchemaPage() {
  const settings = await getTrackingSettings([...SCHEMA_KEYS]);

  return <SchemaForm initialData={settings} />;
}

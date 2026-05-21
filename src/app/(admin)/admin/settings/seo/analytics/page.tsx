import SeoAnalyticsClient from "@/components/admin/seo/SeoAnalyticsClient";
import { getGa4Summary } from "@/app/(admin)/actions/admin-tracking-v2";
import { get404Errors, getSitemapHealth } from "@/app/(admin)/actions/admin-seo";

export default async function SeoAnalyticsPage() {
  const [ga4Data, errorsData, sitemapHealth] = await Promise.all([
    getGa4Summary("7d"),
    get404Errors(50),
    getSitemapHealth(),
  ]);

  return (
    <SeoAnalyticsClient
      initialGa4Data={ga4Data}
      initialErrors={errorsData}
      initialSitemapHealth={sitemapHealth}
      initialRange="7d"
    />
  );
}

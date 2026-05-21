import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { log404Error } from "@/app/(admin)/actions/admin-seo";

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const url = `/${locale}/${slug.join("/")}`;

  // Log 404 error for SEO analytics (fire-and-forget)
  const referrer = (await headers()).get("referer") || null;
  log404Error(url, referrer).catch(() => {});

  notFound();
}

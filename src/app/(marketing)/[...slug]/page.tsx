import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const url = "/" + slug.join("/");

  try {
    const { log404Error } = await import("@/app/(admin)/actions/admin-seo");
    const referrer = (await headers()).get("referer") || null;
    log404Error(url, referrer).catch(() => {});
  } catch {
    // Non-critical
  }

  notFound();
}

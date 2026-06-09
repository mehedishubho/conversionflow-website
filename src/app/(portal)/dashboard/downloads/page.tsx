import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { downloads, licenses, settings, productVersions } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DownloadsList } from "@/components/portal/DownloadsList";
import { DownloadTokenService } from "@/modules/licensing/application/services/DownloadTokenService";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Redirect admin roles to admin dashboard
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "support_staff"
  ) {
    redirect("/admin/dashboard");
  }

  const userId = session.user.id;

  const userDownloads = await db
    .select()
    .from(downloads)
    .where(eq(downloads.userId, userId))
    .orderBy(desc(downloads.createdAt));

  // Fetch platform_url from settings for download URL generation (D-17)
  const [platformUrlSetting] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "platform_url"))
    .limit(1);

  const platformUrl = platformUrlSetting?.value || "";

  // Fetch user's active licenses for token generation (T-32-17)
  const userLicenses = await db
    .select({
      id: licenses.id,
      productId: licenses.productId,
      status: licenses.status,
    })
    .from(licenses)
    .where(
      and(
        eq(licenses.userId, userId),
        sql`${licenses.status} IN ('active', 'grace_period')`
      )
    );

  // Build a map: productId -> licenseId for quick lookup
  const licenseByProduct = new Map<string, string>();
  for (const lic of userLicenses) {
    licenseByProduct.set(lic.productId, lic.id);
  }

  // Fetch all product versions to match download versions to version IDs
  const allVersions = await db
    .select({
      id: productVersions.id,
      productId: productVersions.productId,
      version: productVersions.version,
    })
    .from(productVersions);

  // Build a map: "productId:versionString" -> versionId
  const versionMap = new Map<string, string>();
  for (const v of allVersions) {
    versionMap.set(`${v.productId}:${v.version}`, v.id);
  }

  // Generate HMAC-signed download tokens for each download
  const downloadsWithTokens = userDownloads.map((download) => {
    const licenseId = licenseByProduct.get(download.productId);
    const versionId = versionMap.get(`${download.productId}:${download.version}`);

    // Only generate token if user has an active license and version exists
    if (licenseId && versionId && platformUrl) {
      const signedUrl = DownloadTokenService.generateDownloadUrl(
        platformUrl,
        licenseId,
        versionId
      );
      // Extract just the token query parameter from the signed URL
      const tokenMatch = signedUrl.match(/[?&]token=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : "";
      return { ...download, downloadToken: token };
    }

    // No active license or version not found -- empty token keeps button disabled
    return { ...download, downloadToken: "" };
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Downloads" basePath="/dashboard" />
      <DownloadsList
        downloads={downloadsWithTokens}
        emptyMessage="No downloads available yet. Plugin versions will appear here when released."
      />
    </div>
  );
}

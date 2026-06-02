import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { productVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import ComponentCard from "@/components/common/ComponentCard";
import ProductVersionsTable from "@/components/admin/ProductVersionsTable";
import { releaseVersion } from "@/app/(admin)/actions/admin-products";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Auth check + admin role check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/dashboard");
  }

  // Resolve params
  const { id } = await params;

  // Fetch all versions for this product, newest first
  const versionRows = await db
    .select({
      id: productVersions.id,
      version: productVersions.version,
      downloadUrl: productVersions.downloadUrl,
      changelog: productVersions.changelog,
      status: productVersions.status,
      releasedAt: productVersions.releasedAt,
      createdAt: productVersions.createdAt,
    })
    .from(productVersions)
    .where(eq(productVersions.productId, id))
    .orderBy(desc(productVersions.createdAt));

  return (
    <ComponentCard
      title="Version Management"
      desc="Track product releases. Create draft versions and release them when ready."
    >
      <div className="flex justify-end mb-4">
        <Link
          href="versions/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Version
        </Link>
      </div>
      <ProductVersionsTable
        versions={versionRows.map((row) => ({
          id: row.id,
          version: row.version,
          downloadUrl: row.downloadUrl,
          changelog: row.changelog,
          status: row.status as "stable" | "beta" | "draft",
          releasedAt: row.releasedAt,
          createdAt: row.createdAt,
        }))}
        onRelease={releaseVersion}
      />
    </ComponentCard>
  );
}

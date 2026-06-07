import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { productVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { updateVersion } from "@/app/(admin)/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function EditVersionPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
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
    redirect("/dashboard");
  }

  // Resolve params
  const { id, versionId } = await params;

  // Fetch version from DB
  const [version] = await db
    .select()
    .from(productVersions)
    .where(eq(productVersions.id, versionId))
    .limit(1);

  if (!version) {
    redirect(`/admin/products/${id}/versions`);
  }

  // Wrap updateVersion with inline "use server" for form action serialization
  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateVersion(versionId, formData);
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Edit v${version.version}`}
        basePath={`/admin/products/${id}/versions`}
      />

      <ComponentCard
        title={`Edit Version ${version.version}`}
        desc="Update download URL, changelog, or status for this version."
      >
        <form action={handleUpdate} className="space-y-5">
          {/* Version string (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Version
            </label>
            <input
              type="text"
              value={version.version}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 font-mono cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Version strings cannot be changed after creation.
            </p>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={version.status}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="draft">Draft</option>
              <option value="beta">Beta</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          {/* Download URL */}
          <div>
            <label
              htmlFor="downloadUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Download URL
            </label>
            <input
              type="url"
              id="downloadUrl"
              name="downloadUrl"
              defaultValue={version.downloadUrl ?? ""}
              placeholder="https://downloads.example.com/v1.2.0/plugin.zip"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          {/* Changelog */}
          <div>
            <label
              htmlFor="changelog"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Changelog
            </label>
            <textarea
              id="changelog"
              name="changelog"
              rows={5}
              defaultValue={version.changelog ?? ""}
              placeholder="Describe what changed in this version..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 resize-y"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
            >
              Save Changes
            </button>
            <a
              href={`/admin/products/${id}/versions`}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}

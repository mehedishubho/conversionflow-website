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
        desc="Update changelog, upload/replace ZIP, or change status for this version."
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

          {/* ZIP File Upload / Status (per D-05, D-06) */}
          <div>
            <label
              htmlFor="zipFile"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Plugin ZIP File
            </label>
            {version.downloadUrl ? (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3 py-2 dark:border-success-500/20 dark:bg-success-500/10">
                <svg className="w-4 h-4 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-success-700 dark:text-success-400">
                  Current file: <code className="font-mono">{version.downloadUrl.split('/').pop()}</code>
                </span>
              </div>
            ) : null}
            <input
              type="file"
              id="zipFile"
              name="zipFile"
              accept=".zip"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:file:bg-brand-900/30 dark:file:text-brand-400"
            />
            {version.downloadUrl ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload a new file to replace the current one. Leave empty to keep existing file.
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No file uploaded yet. Upload a ZIP file (max 50 MB).
              </p>
            )}
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

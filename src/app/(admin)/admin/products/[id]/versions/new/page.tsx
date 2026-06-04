import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { createVersion } from "@/app/(admin)/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function NewVersionPage({
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

  // Bind productId to the createVersion action
  const createAction = createVersion.bind(null, id);

  return (
    <div>
      <PageBreadcrumb pageTitle="New Version" basePath={`/admin/products/${id}/versions`} />

      <ComponentCard
        title="Create Version"
        desc="Add a new version to this product. Versions start as draft and can be released later."
      >
        <form action={async (formData: FormData) => { await createAction(formData); }} className="space-y-5">
          {/* Version string (semver) */}
          <div>
            <label
              htmlFor="version"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Version <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="version"
              name="version"
              required
              placeholder="e.g. 1.2.0"
              pattern="[0-9]+\.[0-9]+\.[0-9]+"
              title="Enter a valid semver version (e.g. 1.2.0)"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600 font-mono"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Semantic versioning format: MAJOR.MINOR.PATCH
            </p>
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
              placeholder="https://downloads.example.com/v1.2.0/plugin.zip"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
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
              placeholder="Describe what changed in this version..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600 resize-y"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
            >
              Create Version
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

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, productVersions, productPlans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export const dynamic = "force-dynamic";

export default async function ProductOverviewPage({
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

  // Fetch product details
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      currentVersion: products.currentVersion,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    redirect("/admin/products");
  }

  // Count versions and plans
  const versionCount = await db
    .select({ id: productVersions.id })
    .from(productVersions)
    .where(eq(productVersions.productId, id));

  const planCount = await db
    .select({ id: productPlans.id })
    .from(productPlans)
    .where(and(eq(productPlans.productId, id), eq(productPlans.active, true)));

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={product.name} basePath="/admin/products" />

      <ComponentCard title="Product Details">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
            <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{product.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</dt>
            <dd className="mt-1 text-sm">
              <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono">
                {product.slug}
              </code>
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
            <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
              {product.description ?? <span className="text-gray-400 dark:text-gray-500 italic">No description</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Version</dt>
            <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
              {product.currentVersion ?? <span className="text-gray-400 dark:text-gray-500">&mdash;</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{formatDate(product.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{formatDate(product.updatedAt)}</dd>
          </div>
        </dl>
      </ComponentCard>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <ComponentCard title="Versions">
          <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
            {versionCount.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total versions registered
          </p>
        </ComponentCard>
        <ComponentCard title="Active Plans">
          <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
            {planCount.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pricing plans currently active
          </p>
        </ComponentCard>
      </div>
    </div>
  );
}

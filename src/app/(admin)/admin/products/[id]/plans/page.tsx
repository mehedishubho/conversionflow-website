import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { productPlans } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import ComponentCard from "@/components/common/ComponentCard";
import ProductPlansTable from "@/components/admin/ProductPlansTable";
import { deletePlan } from "@/app/(admin)/actions/admin-products";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductPlansPage({
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
    redirect("/dashboard");
  }

  // Resolve params
  const { id } = await params;

  // Fetch all plans for this product, ordered by sort order
  const planRows = await db
    .select({
      id: productPlans.id,
      name: productPlans.name,
      slug: productPlans.slug,
      priceBDT: productPlans.priceBDT,
      priceUSD: productPlans.priceUSD,
      licenseType: productPlans.licenseType,
      billingCycle: productPlans.billingCycle,
      billingDurationMonths: productPlans.billingDurationMonths,
      maxActivations: productPlans.maxActivations,
      features: productPlans.features,
      active: productPlans.active,
      sortOrder: productPlans.sortOrder,
    })
    .from(productPlans)
    .where(eq(productPlans.productId, id))
    .orderBy(asc(productPlans.sortOrder));

  return (
    <ComponentCard
      title="Plan Management"
      desc="Configure pricing plans with dual-currency support, licensing rules, and feature flags."
    >
      <div className="flex justify-end mb-4">
        <Link
          href={`/admin/products/${id}/plans/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </Link>
      </div>
      <ProductPlansTable
        plans={planRows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          priceBDT: row.priceBDT,
          priceUSD: row.priceUSD,
          licenseType: row.licenseType,
          billingCycle: row.billingCycle,
          billingDurationMonths: row.billingDurationMonths,
          maxActivations: row.maxActivations,
          features: (row.features ?? {}) as Record<string, boolean>,
          active: row.active,
          sortOrder: row.sortOrder,
        }))}
        productId={id}
        onDelete={deletePlan}
      />
    </ComponentCard>
  );
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { productPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PlanForm from "@/components/admin/PlanForm";
import { updatePlan } from "@/app/(admin)/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>;
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
  const { id, planId } = await params;

  // Fetch plan from DB
  const [plan] = await db
    .select()
    .from(productPlans)
    .where(eq(productPlans.id, planId))
    .limit(1);

  if (!plan) {
    redirect(`/admin/products/${id}/plans`);
  }

  // Wrap updatePlan to match PlanForm's action signature (productId, formData)
  const handleUpdate = async (productId: string, formData: FormData) => {
    "use server";
    return await updatePlan(planId, formData);
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Edit Plan"
        basePath={`/admin/products/${id}/plans`}
      />

      <ComponentCard
        title="Edit Plan"
        desc="Update pricing, licensing rules, and feature flags for this plan."
      >
        <PlanForm
          productId={id}
          action={handleUpdate}
          plan={{
            id: plan.id,
            name: plan.name,
            description: plan.description,
            priceBDT: plan.priceBDT,
            priceUSD: plan.priceUSD,
            licenseType: plan.licenseType,
            billingCycle: plan.billingCycle,
            billingDurationMonths: plan.billingDurationMonths,
            maxActivations: plan.maxActivations ?? 1,
            features: (plan.features as Record<string, boolean>) ?? {},
            sortOrder: plan.sortOrder ?? 0,
            active: plan.active ?? true,
          }}
        />
      </ComponentCard>
    </div>
  );
}

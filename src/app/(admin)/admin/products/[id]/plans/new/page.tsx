import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PlanForm from "@/components/admin/PlanForm";
import { createPlan } from "@/app/(admin)/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function NewPlanPage({
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

  return (
    <div>
      <PageBreadcrumb pageTitle="New Plan" basePath={`/admin/products/${id}/plans`} />

      <ComponentCard
        title="Create Plan"
        desc="Define a new pricing plan with licensing rules, dual-currency pricing, and feature flags."
      >
        <PlanForm
          productId={id}
          action={createPlan}
        />
      </ComponentCard>
    </div>
  );
}

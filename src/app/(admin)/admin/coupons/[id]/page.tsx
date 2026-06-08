import { requireAdmin } from "@/lib/auth-guard";
import { getCouponById, updateCoupon } from "@/app/(admin)/actions/admin-coupons";
import { db } from "@/lib/db";
import { products, productPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CouponEditForm from "./CouponEditForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const result = await getCouponById(id);
  if (!("success" in result) || !result.success) {
    notFound();
  }

  const coupon = result.coupon;

  const allProducts = await db
    .select({ id: products.id, name: products.name, slug: products.slug })
    .from(products);

  const allPlans = await db
    .select({
      id: productPlans.id,
      productId: productPlans.productId,
      name: productPlans.name,
    })
    .from(productPlans)
    .where(eq(productPlans.active, true));

  // Format expiresAt for date input (YYYY-MM-DD)
  let expiresAtValue = "";
  if (coupon.expiresAt) {
    const d = new Date(coupon.expiresAt);
    expiresAtValue = d.toISOString().split("T")[0];
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Coupon" basePath="/admin/coupons" />

      <ComponentCard
        title="Edit Coupon"
        desc={`Editing coupon: ${coupon.code}`}
      >
        <CouponEditForm
          action={updateCoupon}
          coupon={{
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrderAmount: coupon.minOrderAmount,
            maxUses: coupon.maxUses,
            expiresAt: expiresAtValue,
            scope: coupon.scope,
            applicableProductId: coupon.applicableProductId,
            applicablePlanIds: coupon.applicablePlanIds,
          }}
          products={allProducts}
          plans={allPlans}
        />
      </ComponentCard>
    </div>
  );
}

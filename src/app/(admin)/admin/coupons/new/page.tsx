import { requireAdmin } from "@/lib/auth-guard";
import { createCoupon } from "@/app/(admin)/actions/admin-coupons";
import { db } from "@/lib/db";
import { products, productPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CouponCreateForm from "./CouponCreateForm";

export const dynamic = "force-dynamic";

export default async function NewCouponPage() {
  await requireAdmin();

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

  return (
    <div>
      <PageBreadcrumb pageTitle="New Coupon" basePath="/admin/coupons" />

      <ComponentCard
        title="Create Coupon"
        desc="Create a new discount code. Choose between percentage or flat discount."
      >
        <CouponCreateForm
          action={createCoupon}
          products={allProducts}
          plans={allPlans}
        />
      </ComponentCard>
    </div>
  );
}

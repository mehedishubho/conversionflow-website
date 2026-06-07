import { requireAdmin } from "@/lib/auth-guard";
import { createCoupon } from "@/app/(admin)/actions/admin-coupons";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CouponCreateForm from "./CouponCreateForm";

export const dynamic = "force-dynamic";

export default async function NewCouponPage() {
  await requireAdmin();

  return (
    <div>
      <PageBreadcrumb pageTitle="New Coupon" basePath="/admin/coupons" />

      <ComponentCard
        title="Create Coupon"
        desc="Create a new discount code. Choose between percentage or flat discount."
      >
        <CouponCreateForm action={createCoupon} />
      </ComponentCard>
    </div>
  );
}

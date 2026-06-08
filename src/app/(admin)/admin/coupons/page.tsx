import { requireAdmin } from "@/lib/auth-guard";
import { listCoupons, toggleCouponActive, deleteCoupon } from "@/app/(admin)/actions/admin-coupons";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CouponsTable from "@/components/admin/CouponsTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdmin();

  const { coupons: couponRows } = await listCoupons();

  return (
    <div>
      <PageBreadcrumb pageTitle="Coupons" basePath="/admin/dashboard" />

      <ComponentCard
        title="Coupon Management"
        desc="Create and manage discount codes for customers. Toggle active status or delete expired coupons."
      >
        <div className="flex justify-end">
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </Link>
        </div>
        <CouponsTable
          coupons={couponRows.map((row) => ({
            id: row.id,
            code: row.code,
            type: row.type,
            value: row.value,
            minOrderAmount: row.minOrderAmount ?? null,
            maxUses: row.maxUses ?? null,
            currentUses: row.currentUses ?? null,
            expiresAt: row.expiresAt ?? null,
            active: row.active ?? true,
            createdAt: row.createdAt,
            scope: row.scope ?? "all",
            productName: row.productName ?? null,
            applicablePlans: row.applicablePlans ?? [],
          }))}
          onToggleActive={toggleCouponActive}
          onDelete={deleteCoupon}
        />
      </ComponentCard>
    </div>
  );
}

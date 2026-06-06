import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ProductsTable from "@/components/admin/ProductsTable";
import { deleteProduct } from "@/app/(admin)/actions/admin-products";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  // Query all products
  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      currentVersion: products.currentVersion,
      createdAt: products.createdAt,
    })
    .from(products)
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Products" basePath="/admin/dashboard" />

      <ComponentCard
        title="Product Management"
        desc="View and manage all products. Create new products, manage versions, and configure pricing plans."
      >
        <div className="flex justify-end">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
        <ProductsTable
          products={productRows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            currentVersion: row.currentVersion,
            createdAt: row.createdAt,
          }))}
          onDelete={deleteProduct}
        />
      </ComponentCard>
    </div>
  );
}

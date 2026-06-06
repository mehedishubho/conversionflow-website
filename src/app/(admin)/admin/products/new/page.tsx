import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/app/(admin)/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
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

  return (
    <div>
      <PageBreadcrumb pageTitle="New Product" basePath="/admin/products" />

      <ComponentCard title="Create Product" desc="Add a new product to the catalog. You can configure versions and pricing plans after creation.">
        <ProductForm action={createProduct} />
      </ComponentCard>
    </div>
  );
}

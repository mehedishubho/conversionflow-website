import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/(admin)/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
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

  // Fetch product
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      currentVersion: products.currentVersion,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    redirect("/admin/products");
  }

  // Bind productId to updateProduct for the form action
  const updateAction = updateProduct.bind(null, product.id);

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Product" basePath={`/admin/products/${id}`} />

      <ComponentCard title="Edit Product" desc={`Update details for ${product.name}.`}>
        <ProductForm
          action={updateAction}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            currentVersion: product.currentVersion,
          }}
          submitButtonLabel="Save Changes"
        />
      </ComponentCard>
    </div>
  );
}

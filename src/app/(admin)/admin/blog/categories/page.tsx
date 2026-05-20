import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BlogCategoryManager from "@/components/admin/blog/BlogCategoryManager";
import { getAllCategories } from "@/app/(admin)/actions/admin-blog";

export const dynamic = "force-dynamic";

export default async function BlogCategoriesPage() {
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

  const categories = await getAllCategories();

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Blog Categories"
        basePath="/admin/dashboard"
      />

      <ComponentCard
        title="Blog Categories"
        desc="Manage categories for organizing blog posts. Categories are locale-specific."
      >
        <BlogCategoryManager initialCategories={categories} />
      </ComponentCard>
    </div>
  );
}

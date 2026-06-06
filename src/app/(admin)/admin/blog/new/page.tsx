import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import { getAllCategories } from "@/app/(admin)/actions/admin-blog";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
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

  const categories = await getAllCategories();

  return (
    <div>
      <PageBreadcrumb pageTitle="New Post" basePath="/admin/dashboard" />

      <ComponentCard title="Create Blog Post" desc="Write a new blog post with rich content editor.">
        <BlogPostForm
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            locale: c.locale,
          }))}
        />
      </ComponentCard>
    </div>
  );
}

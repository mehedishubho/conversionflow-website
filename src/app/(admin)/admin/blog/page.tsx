import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BlogPostTable from "@/components/admin/blog/BlogPostTable";
import { getAllPosts } from "@/app/(admin)/actions/admin-blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
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

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const { posts, total, pageSize } = await getAllPosts(page);

  return (
    <div>
      <PageBreadcrumb pageTitle="Blog" basePath="/admin/dashboard" />

      <ComponentCard
        title="Blog Posts"
        desc="Manage blog posts for the public website."
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Link
              href="/admin/blog/new"
              className="text-sm px-4 py-2 rounded-lg font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              New Post
            </Link>
            <Link
              href="/admin/blog/categories"
              className="text-sm px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              Categories
            </Link>
          </div>
        </div>
        <BlogPostTable
          posts={posts.map((p) => ({
            ...p,
            publishedAt: p.publishedAt ?? null,
            createdAt: p.createdAt,
            categoryName: p.categoryName ?? null,
          }))}
          total={total}
          page={page}
          pageSize={pageSize}
        />
      </ComponentCard>
    </div>
  );
}

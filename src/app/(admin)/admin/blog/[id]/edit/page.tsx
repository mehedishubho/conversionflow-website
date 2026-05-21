import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import {
  getPostById,
  getAllCategories,
} from "@/app/(admin)/actions/admin-blog";
import type { SeoOverrides } from "@/app/(admin)/actions/admin-page-seo";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const categories = await getAllCategories();

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Post" basePath="/admin/dashboard" />

      <ComponentCard
        title={`Edit: ${post.title}`}
        desc="Update blog post content, metadata, and SEO settings."
      >
        <BlogPostForm
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            locale: c.locale,
          }))}
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt ?? undefined,
            coverImage: post.coverImage ?? undefined,
            categoryId: post.categoryId ?? undefined,
            tags: post.tags as string[],
            authorName: post.authorName,
            locale: post.locale as "en" | "bn",
            status: post.status as "draft" | "published",
            seoTitle: post.seoTitle ?? undefined,
            seoDescription: post.seoDescription ?? undefined,
            ogImage: post.ogImage ?? undefined,
            seoOverrides: (post.seoOverrides as SeoOverrides) ?? undefined,
          }}
        />
      </ComponentCard>
    </div>
  );
}

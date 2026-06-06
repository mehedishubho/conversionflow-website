import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BackButton from "@/components/common/BackButton";
import BlogPostForm from "@/components/admin/blog/BlogPostForm";
import {
  getPostById,
  getAllCategories,
} from "@/app/(admin)/actions/admin-blog";
import type { SeoOverrides } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Safe parser for SeoOverrides to handle malformed JSON
function safeParseSeoOverrides(value: unknown): SeoOverrides | undefined {
  if (!value) return undefined;
  if (typeof value === 'object' && value !== null) {
    return value as SeoOverrides;
  }
  return undefined;
}

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
    redirect("/dashboard");
  }

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const categories = await getAllCategories();

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <BackButton href="/admin/blog" />
        <PageBreadcrumb pageTitle="Edit Post" basePath="/admin/dashboard" />
      </div>

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
            seoOverrides: safeParseSeoOverrides(post.seoOverrides),
          }}
        />
      </ComponentCard>
    </div>
  );
}

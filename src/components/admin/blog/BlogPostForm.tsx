"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/input/InputField";
import TiptapEditor from "./TiptapEditor";
import {
  createBlogPost,
  updateBlogPost,
} from "@/app/(admin)/actions/admin-blog";
import type { BlogPostInput } from "@/app/(admin)/actions/admin-blog";

interface Category {
  id: string;
  name: string;
  locale: string;
}

interface BlogPostFormProps {
  categories: Category[];
  initialData?: Partial<BlogPostInput & { id: string }>;
}

export default function BlogPostForm({
  categories,
  initialData,
}: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId ?? ""
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") ?? ""
  );
  const [authorName, setAuthorName] = useState(
    initialData?.authorName ?? ""
  );
  const [locale, setLocale] = useState<"en" | "bn">(
    initialData?.locale ?? "bn"
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft"
  );
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription ?? ""
  );
  const [ogImage, setOgImage] = useState(initialData?.ogImage ?? "");

  const handleSlugFromTitle = () => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9ঀ-৿\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !slug || !content || !authorName) {
      setMessage({
        type: "error",
        text: "Title, slug, content, and author name are required.",
      });
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const data: BlogPostInput = {
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      categoryId: categoryId || undefined,
      tags,
      authorName,
      locale,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      ogImage: ogImage || undefined,
    };

    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updateBlogPost(initialData.id, data);
          setMessage({ type: "success", text: "Post updated." });
        } else {
          const result = await createBlogPost(data);
          if ("error" in result && result.error) {
            setMessage({ type: "error", text: result.error });
            return;
          }
          router.push("/admin/blog");
        }
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  const filteredCategories = categories.filter(
    (c) => c.locale === locale
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Title *
            </label>
            <div className="flex gap-2">
              <InputField
                placeholder="Post title"
                defaultValue={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSlugFromTitle}
                className="shrink-0 text-xs px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Gen Slug
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Slug *
            </label>
            <InputField
              placeholder="post-url-slug"
              defaultValue={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Content *
            </label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog post..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              placeholder="Brief summary of the post..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Locale
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "bn")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              <option value="bn">Bangla</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              <option value="">None</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Author Name *
            </label>
            <InputField
              placeholder="Author name"
              defaultValue={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Cover Image URL
            </label>
            <InputField
              placeholder="https://..."
              defaultValue={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Tags (comma-separated)
            </label>
            <InputField
              placeholder="tag1, tag2, tag3"
              defaultValue={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              SEO
            </h4>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  SEO Title
                </label>
                <InputField
                  placeholder="SEO title"
                  defaultValue={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  SEO Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                  placeholder="Meta description..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  OG Image URL
                </label>
                <InputField
                  placeholder="https://..."
                  defaultValue={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? "Saving..."
            : initialData?.id
              ? "Update Post"
              : "Create Post"}
        </button>
      </div>
    </form>
  );
}

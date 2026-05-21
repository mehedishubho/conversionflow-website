"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleBlogPostStatus,
  deleteBlogPost,
} from "@/app/(admin)/actions/admin-blog";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  authorName: string;
  locale: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  categoryName: string | null;
}

interface BlogPostTableProps {
  posts: PostRow[];
  total: number;
  page: number;
  pageSize: number;
}

export default function BlogPostTable({
  posts,
  total,
  page,
  pageSize,
}: BlogPostTableProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleToggle = (id: string) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await toggleBlogPostStatus(id);
        if ("error" in result && result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({
            type: "success",
            text: "Post status updated.",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Failed to toggle post status." });
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await deleteBlogPost(id);
        setMessage({ type: "success", text: "Post deleted." });
      } catch {
        setMessage({ type: "error", text: "Failed to delete post." });
      }
    });
  };

  return (
    <div className="space-y-4">
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

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Title
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Category
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Locale
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Date
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {posts.map((post) => (
              <tr
                key={post.id}
                className="bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06]"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800 dark:text-white/90">
                    {post.title}
                  </div>
                  <div className="text-xs text-gray-400">/{post.slug}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {post.categoryName || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {post.locale.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      post.status === "published"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                    }`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(post.id)}
                      disabled={isPending}
                      className="text-xs px-2.5 py-1 rounded font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-xs px-2.5 py-1 rounded font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={isPending}
                      className="text-xs px-2.5 py-1 rounded font-medium bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                >
                  No posts found.{" "}
                  <Link
                    href="/admin/blog/new"
                    className="text-brand-500 hover:underline"
                  >
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Page {page} of {totalPages} ({total} posts)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/blog?page=${page - 1}`}
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/blog?page=${page + 1}`}
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

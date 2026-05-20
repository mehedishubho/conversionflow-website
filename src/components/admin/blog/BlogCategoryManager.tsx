"use client";

import { useState, useTransition } from "react";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/app/(admin)/actions/admin-blog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  locale: string;
}

interface BlogCategoryManagerProps {
  initialCategories: Category[];
}

export default function BlogCategoryManager({
  initialCategories,
}: BlogCategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newLocale, setNewLocale] = useState<"en" | "bn">("bn");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug) return;

    startTransition(async () => {
      const result = await createBlogCategory({
        name: newName,
        slug: newSlug,
        locale: newLocale,
      });
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setNewName("");
      setNewSlug("");
      setMessage({ type: "success", text: "Category created. Refresh to see it." });
    });
  };

  const handleUpdate = (id: string) => {
    startTransition(async () => {
      try {
        await updateBlogCategory(id, {
          name: editName,
          slug: editSlug,
        });
        setEditId(null);
        setMessage({ type: "success", text: "Category updated." });
      } catch {
        setMessage({ type: "error", text: "Failed to update category." });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Posts will lose their category.`))
      return;
    startTransition(async () => {
      await deleteBlogCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMessage({ type: "success", text: "Category deleted." });
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

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]"
      >
        <div className="flex-1 min-w-[150px]">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Slug
          </label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="category-slug"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
          />
        </div>
        <div className="w-28">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Locale
          </label>
          <select
            value={newLocale}
            onChange={(e) => setNewLocale(e.target.value as "en" | "bn")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            <option value="bn">Bangla</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending || !newName || !newSlug}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Slug
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Locale
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06]"
              >
                <td className="px-4 py-3">
                  {editId === cat.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    />
                  ) : (
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {cat.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {editId === cat.id ? (
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    />
                  ) : (
                    cat.slug
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {cat.locale.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {editId === cat.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(cat.id)}
                        className="text-xs px-2.5 py-1 rounded font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="text-xs px-2.5 py-1 rounded font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(cat.id);
                          setEditName(cat.name);
                          setEditSlug(cat.slug);
                        }}
                        className="text-xs px-2.5 py-1 rounded font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-xs px-2.5 py-1 rounded font-medium bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-400 dark:text-gray-500"
                >
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

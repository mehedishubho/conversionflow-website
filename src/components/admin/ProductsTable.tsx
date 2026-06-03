"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Trash2, Edit, Eye, Plus } from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currentVersion: string | null;
  createdAt: Date;
}

interface ProductsTableProps {
  products: ProductRow[];
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ProductsTable({
  products,
  onDelete,
}: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({ open: false, productId: "", productName: "" });
  const [actionError, setActionError] = useState<string | null>(null);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Delete handler
  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await onDelete(deleteModal.productId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setDeleteModal({ open: false, productId: "", productName: "" });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Error display */}
      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Slug
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Current Version
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Created
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span>No products yet.</span>
                    <Link
                      href="/admin/products/new"
                      className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Create your first product
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {product.name}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-xs font-mono">
                      {product.slug}
                    </code>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {product.currentVersion ?? (
                      <span className="text-gray-400 dark:text-gray-500">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(product.createdAt)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                        title="Delete"
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            productId: product.id,
                            productName: product.name,
                          })
                        }
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => {
          setDeleteModal({ open: false, productId: "", productName: "" });
          setActionError(null);
        }}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Delete &ldquo;{deleteModal.productName}&rdquo;?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will permanently delete the product and all its associated versions and plans. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDeleteModal({ open: false, productId: "", productName: "" });
              setActionError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete Product
          </Button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useTransition, useEffect, useRef, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import RedirectForm from "@/components/admin/seo/RedirectForm";
import RedirectCsvImport from "@/components/admin/seo/RedirectCsvImport";
import {
  getRedirects,
  deleteRedirects,
  type RedirectRow,
} from "@/app/(admin)/actions/admin-redirects";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function RedirectTable() {
  const [isPending, startTransition] = useTransition();

  // Data state
  const [redirectData, setRedirectData] = useState<RedirectRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editData, setEditData] = useState<RedirectRow | null>(null);

  // ──────────────────────────────────────────────
  // Fetch redirects
  // ──────────────────────────────────────────────

  const fetchRedirects = useCallback(
    (page = 1, searchVal?: string, statusVal?: string) => {
      startTransition(async () => {
        const result = await getRedirects(
          page,
          pageSize,
          searchVal ?? search,
          statusVal ?? statusFilter
        );
        setRedirectData(result.redirects);
        setTotal(result.total);
        setCurrentPage(result.page);
      });
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchRedirects(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────────────────────
  // Search with debounce
  // ──────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchRedirects(1, value);
    }, 300);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchRedirects(1, search, value);
  };

  // ──────────────────────────────────────────────
  // Selection
  // ──────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === redirectData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(redirectData.map((r) => r.id)));
    }
  };

  // ──────────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────────

  const handleDelete = (ids: string[]) => {
    startTransition(async () => {
      await deleteRedirects(ids);
      setSelectedIds(new Set());
      fetchRedirects(currentPage);
    });
  };

  const handleEdit = (row: RedirectRow) => {
    setEditData(row);
    setFormOpen(true);
  };

  const handleFormSave = () => {
    setFormOpen(false);
    setEditData(null);
    fetchRedirects(currentPage);
  };

  const handleImportDone = () => {
    fetchRedirects(1);
  };

  // ──────────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────────

  const totalPages = Math.ceil(total / pageSize);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchRedirects(page);
  };

  // ──────────────────────────────────────────────
  // Format helpers
  // ──────────────────────────────────────────────

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-60">
            <InputField
              placeholder="Search by from URL..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              options={statusFilterOptions}
              placeholder="All Statuses"
              defaultValue={statusFilter}
              onChange={handleStatusFilterChange}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setCsvOpen(true)}>
            Import / Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditData(null);
              setFormOpen(true);
            }}
          >
            Add Redirect
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
            onClick={() => handleDelete([...selectedIds])}
            disabled={isPending}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-10">
                <input
                  type="checkbox"
                  checked={
                    redirectData.length > 0 &&
                    selectedIds.size === redirectData.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                From URL
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                To URL
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-24">
                Type
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-20">
                Regex
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-20">
                Hits
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-24">
                Status
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-28">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redirectData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No redirects found. Click &quot;Add Redirect&quot; to create
                  one, or import from CSV.
                </TableCell>
              </TableRow>
            ) : (
              redirectData.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <TableCell className="px-4 py-3 text-start">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90 max-w-[200px] truncate">
                    {row.fromUrl}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                    {row.toUrl}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <Badge
                      variant="light"
                      color={row.type === "301" ? "info" : "warning"}
                      size="sm"
                    >
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {row.isRegex ? (
                      <Badge variant="light" color="info" size="sm">
                        Regex
                      </Badge>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        No
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.hitCount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <Badge
                      variant="light"
                      color={row.status === "active" ? "success" : "light"}
                      size="sm"
                    >
                      {row.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(row)}
                        disabled={isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
                        onClick={() => handleDelete([row.id])}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, total)} of {total}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1 || isPending}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? "primary" : "outline"}
                  onClick={() => goToPage(pageNum)}
                  disabled={isPending}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <RedirectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSave={handleFormSave}
        editData={editData}
      />

      {/* CSV Import/Export Modal */}
      <RedirectCsvImport
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={handleImportDone}
      />
    </div>
  );
}

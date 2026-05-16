import Badge from "@/components/ui/badge/Badge";
import { LicenseKeyCopy } from "@/components/portal/LicenseKeyCopy";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";

type LicenseRow = {
  id: string;
  licenseKey: string;
  plan: string;
  status: "active" | "expired" | "revoked" | "suspended";
  currentActivations: number;
  maxActivations: number;
  expiresAt: Date | null;
};

interface LicenseTableProps {
  licenses: LicenseRow[];
  emptyMessage?: string;
}

const statusBadgeMap: Record<
  LicenseRow["status"],
  "success" | "warning" | "error" | "light"
> = {
  active: "success",
  expired: "warning",
  revoked: "error",
  suspended: "light",
};

export function LicenseTable({
  licenses,
  emptyMessage = "No licenses found.",
}: LicenseTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
            >
              License Key
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
            >
              Plan
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
            >
              Status
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
            >
              Activations
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
            >
              Expires
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            licenses.map((license) => (
              <TableRow
                key={license.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <TableCell className="px-5 py-4">
                  <LicenseKeyCopy licenseKey={license.licenseKey} />
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {license.plan}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge variant="light" color={statusBadgeMap[license.status]}>
                    {license.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {license.currentActivations} / {license.maxActivations}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {license.expiresAt
                    ? format(new Date(license.expiresAt), "MMM d, yyyy")
                    : "Never"}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Link
                    href={`/dashboard/licenses/${license.id}`}
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View Details
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

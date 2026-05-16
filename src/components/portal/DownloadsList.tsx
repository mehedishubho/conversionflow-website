import { Download } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { ChangelogExpandable } from "@/components/portal/ChangelogExpandable";
import { format } from "date-fns";

type DownloadRow = {
  id: string;
  version: string;
  fileName: string;
  downloadToken: string;
  createdAt: Date;
  changelog?: string | null;
};

interface DownloadsListProps {
  downloads: DownloadRow[];
  emptyMessage?: string;
}

export function DownloadsList({
  downloads,
  emptyMessage = "No downloads available.",
}: DownloadsListProps) {
  const latest = downloads.length > 0 ? downloads[0] : null;
  const older = downloads.slice(1);

  if (!latest && downloads.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {/* Featured latest version card */}
      {latest && (
        <div className="mb-6 rounded-2xl border-2 border-brand-200 bg-white p-6 dark:border-brand-500/30 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {latest.version}
                </span>
                <span className="ml-2">
                  <Badge variant="solid" color="primary" size="sm">
                    Latest
                  </Badge>
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(latest.createdAt), "MMM d, yyyy")}
              </p>
              <p className="mt-1 font-mono text-sm text-gray-400 dark:text-gray-500">
                {latest.fileName}
              </p>
            </div>
            <div>
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white opacity-60 dark:bg-brand-500"
              >
                <Download className="h-4 w-4" />
                Download Latest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version history */}
      {older.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Version History
          </h3>
          <div className="space-y-3">
            {older.map((download) => (
              <div
                key={download.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {download.version}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(download.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="font-mono text-sm text-gray-400 dark:text-gray-500">
                      {download.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      disabled
                      className="cursor-not-allowed text-gray-400 opacity-60 hover:text-gray-500 dark:text-gray-500"
                      aria-label={`Download version ${download.version}`}
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {download.changelog !== undefined && (
                  <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <ChangelogExpandable changelog={download.changelog ?? null} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

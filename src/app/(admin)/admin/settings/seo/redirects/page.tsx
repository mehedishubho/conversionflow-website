import ComponentCard from "@/components/common/ComponentCard";
import RedirectTable from "@/components/admin/seo/RedirectTable";

export default function SeoRedirectsPage() {
  return (
    <div className="space-y-6">
      <ComponentCard
        title="Redirect Manager"
        desc="Manage URL redirects with 301/302 support, regex patterns, bulk import/export, and hit tracking."
      >
        <RedirectTable />
      </ComponentCard>

      <ComponentCard
        title="How Redirects Work"
        desc="Information about the redirect system."
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Redirects are checked on every incoming request before
            authentication and i18n routing. When a request URL matches an
            active redirect rule, the visitor is redirected with the
            configured HTTP status code.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>301 (Permanent):</strong> Tells search engines the page
              has permanently moved. SEO value transfers to the new URL.
            </li>
            <li>
              <strong>302 (Temporary):</strong> Tells search engines the move
              is temporary. Original URL keeps its SEO value.
            </li>
            <li>
              <strong>Regex:</strong> Match URL patterns using regular
              expressions. Use capture groups like{" "}
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                (.*)
              </code>{" "}
              and reference them with{" "}
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                $1
              </code>
              ,{" "}
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                $2
              </code>
              .
            </li>
          </ul>
          <p>
            <strong>CSV format:</strong> Two columns,{" "}
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
              from_url,to_url
            </code>{" "}
            with one redirect per line. All imported redirects default to 301
            non-regex active status.
          </p>
        </div>
      </ComponentCard>
    </div>
  );
}

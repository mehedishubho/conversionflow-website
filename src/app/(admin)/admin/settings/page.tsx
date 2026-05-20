import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { CreditCard, Mail, Search } from "lucide-react";

const SETTINGS_CATEGORIES = [
  {
    title: "Payment Gateway",
    description: "Configure payment methods, VAT settings, and SSL Commerce integration.",
    href: "/admin/settings/payment",
    icon: CreditCard,
    settingKeys: ["payment_accounts", "vat_rate"],
  },
  {
    title: "SMTP / Email",
    description: "Configure email provider, SMTP connection, and sender details.",
    href: "/admin/settings/smtp",
    icon: Mail,
    settingKeys: ["email_provider", "smtp_host"],
  },
  {
    title: "SEO Settings",
    description: "Configure search engine optimization, tracking pixels, and social metadata.",
    href: "/admin/settings/seo",
    icon: Search,
    settingKeys: ["seo_general_title", "google_analytics_id"],
  },
];

export default function SettingsLandingPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" basePath="/admin/dashboard" />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your platform configuration, payment gateway, email provider, and SEO settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {SETTINGS_CATEGORIES.map((category) => (
          <Link key={category.href} href={category.href} className="group">
            <ComponentCard
              title={category.title}
              desc={category.description}
              className="h-full transition-shadow group-hover:shadow-md dark:group-hover:shadow-gray-900/50"
            >
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Configure
                  </span>
                </div>
                <span className="text-sm font-medium text-brand-500 dark:text-brand-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Open
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </ComponentCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

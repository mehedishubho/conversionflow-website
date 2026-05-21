import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import PageLevelSeoForm from "@/components/admin/seo/PageLevelSeoForm";

export const dynamic = "force-dynamic";

export default async function PageLevelSeoPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Page-Level SEO"
        basePath="/admin/dashboard"
        subPaths={[{ label: "Settings", href: "/admin/settings" }]}
      />

      <ComponentCard
        title="Page-Level SEO"
        desc="Configure SEO overrides for individual marketing pages. These settings take precedence over global SEO configuration."
      >
        <PageLevelSeoForm />
      </ComponentCard>
    </div>
  );
}

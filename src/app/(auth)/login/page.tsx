import SignInForm from "@/components/auth/SignInForm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "super_admin"));

  if (Number(adminCount[0].count) === 0) {
    redirect("/admin/setup");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center">
        <div className="text-white text-center px-12">
          <h1 className="font-heading text-4xl font-bold mb-4">
            ConversionFlow
          </h1>
          <p className="text-lg opacity-90">
            WooCommerce automation for Bangladeshi eCommerce
          </p>
        </div>
      </div>
      {/* Right: Sign-in form */}
      <SignInForm />
    </div>
  );
}

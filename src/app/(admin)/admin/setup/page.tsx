import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { user } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "super_admin"));

  if (adminCount[0].count > 0) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center">
        <div className="text-white text-center px-12">
          <h1 className="text-4xl font-bold mb-4">
            ConversionFlow
          </h1>
          <p className="text-lg opacity-90">
            Create the first admin account to get started
          </p>
        </div>
      </div>
      {/* Right: Setup form */}
      <SetupForm />
    </div>
  );
}

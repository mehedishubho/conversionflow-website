import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { user } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import SetupForm from "./SetupForm";

// This page queries the database at request time -- must be dynamically rendered
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // Check if any super_admin already exists
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "super_admin"));

  if (adminCount[0].count > 0) {
    // Setup already completed -- redirect to login
    redirect("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Initial Admin Setup</h1>
          <p className="text-[--text2]">
            Create the first super admin account for ConversionFlow
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}

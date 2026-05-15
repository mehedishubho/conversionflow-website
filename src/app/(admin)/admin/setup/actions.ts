"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function completeSetup(userId: string) {
  // Double-check no super_admin exists (race condition protection)
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, "super_admin"));

  if (adminCount[0].count > 0) {
    return { error: "Setup already completed. An admin account exists." };
  }

  // Set role to super_admin
  await db
    .update(user)
    .set({ role: "super_admin" })
    .where(eq(user.id, userId));

  return { success: true };
}

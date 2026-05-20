"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name || name.trim().length < 1) {
    return { error: "Name is required" };
  }

  await db
    .update(user)
    .set({ name: name.trim(), phone: phone?.trim() || "" })
    .where(eq(user.id, userId));

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword) {
    return { error: "Current password is required" };
  }
  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Password change is handled client-side via authClient.changePassword
  // which validates the current password through Better Auth API.
  // This server action performs validation only.
  return { success: true, message: "Validation passed" };
}

export async function updateNotificationPreferences(
  preferences: Record<string, boolean>
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Placeholder: notification preferences storage requires a
  // notificationPreferences column on user table or a separate table.
  // Will be enhanced when notification email delivery is added in Phase 6.
  return { success: true };
}

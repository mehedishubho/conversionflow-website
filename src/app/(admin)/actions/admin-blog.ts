"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

// ──────────────────────────────────────────────
// Admin Role Guard
// ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Toggle Blog Post Status (draft <-> published)
// ──────────────────────────────────────────────

export async function toggleBlogPostStatus(postId: string) {
  const { userId, role } = await requireAdmin();

  if (!postId) {
    return { error: "Post ID is required." };
  }

  // Fetch the current post
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!post) {
    return { error: "Blog post not found." };
  }

  const newStatus = post.status === "published" ? "draft" : "published";

  // Update the post status
  await db
    .update(blogPosts)
    .set({
      status: newStatus,
      publishedAt: newStatus === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "blog_post.status_changed",
    targetType: "blog_post",
    targetId: postId,
    details: {
      title: post.title,
      from: post.status,
      to: newStatus,
    },
  });

  // Send notification ONLY when status changes TO "published"
  if (newStatus === "published") {
    try {
      await sendNotification(userId, "system.blog_published", {
        postTitle: post.title,
        slug: post.slug,
        locale: post.locale,
      });
    } catch (e) {
      console.error("Failed to send blog notification:", e);
    }
  }

  return { success: true, newStatus };
}

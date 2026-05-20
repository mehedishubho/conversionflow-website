"use server";

import { db } from "@/lib/db";
import { tickets, ticketMessages, ticketPriorityEnum } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function createTicket(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  const subject = formData.get("subject") as string;
  const priorityRaw = formData.get("priority") as string;
  const description = formData.get("description") as string;

  if (!subject || !description) {
    return { error: "Subject and description are required" };
  }

  const validPriorities = ["low", "medium", "high", "urgent"] as const;
  const priority = validPriorities.includes(priorityRaw as typeof validPriorities[number])
    ? (priorityRaw as typeof validPriorities[number])
    : "medium";

  // Process attachments (files from formData)
  const attachments: Array<{
    fileName: string;
    storedName: string;
    size: number;
    type: string;
  }> = [];
  const files = formData.getAll("files") as File[];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) continue; // skip files > 10MB
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = join(process.cwd(), "uploads", "tickets");
    await mkdir(uploadDir, { recursive: true });
    const storedName = `${Date.now()}-${file.name}`;
    await writeFile(join(uploadDir, storedName), buffer);
    attachments.push({
      fileName: file.name,
      storedName,
      size: file.size,
      type: file.type,
    });
  }

  await db.insert(tickets).values({
    userId,
    subject,
    description,
    priority,
    status: "open",
    attachments,
  });

  return { success: true };
}

export async function replyToTicket(ticketId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  // Verify ticket belongs to user (IDOR protection per T-03-10)
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.userId, userId)));
  if (!ticket) return { error: "Ticket not found" };

  const message = formData.get("message") as string;
  if (!message) return { error: "Message is required" };

  // Process attachments
  const attachments: Array<{
    fileName: string;
    storedName: string;
    size: number;
    type: string;
  }> = [];
  const files = formData.getAll("files") as File[];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) continue;
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = join(process.cwd(), "uploads", "tickets");
    await mkdir(uploadDir, { recursive: true });
    const storedName = `${Date.now()}-${file.name}`;
    await writeFile(join(uploadDir, storedName), buffer);
    attachments.push({
      fileName: file.name,
      storedName,
      size: file.size,
      type: file.type,
    });
  }

  await db.insert(ticketMessages).values({
    ticketId,
    userId,
    message,
    attachments,
  });

  return { success: true };
}

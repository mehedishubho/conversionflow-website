import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BackupService } from "@/lib/backup/BackupService";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check — T-21-03 mitigation: validate backupId from DB, not user path
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Look up backup record from DB (never trust user-supplied file paths)
    const backupService = new BackupService();
    const backup = await backupService.getBackupById(id);

    if (!backup) {
      return NextResponse.json(
        { error: "Backup not found" },
        { status: 404 }
      );
    }

    if (!fs.existsSync(backup.filePath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(backup.filePath);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${backup.filename}"`,
      },
    });
  } catch (error) {
    console.error("[Backup Download Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to download backup" },
      { status: 500 }
    );
  }
}

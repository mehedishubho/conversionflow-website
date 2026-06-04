import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RestoreOrchestrator } from "@/lib/backup/RestoreOrchestrator";

export async function GET(request: NextRequest) {
  try {
    // T-21-02 mitigation: require admin auth for restore status
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const status = await RestoreOrchestrator.getRestoreStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[Restore Status Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to get restore status" },
      { status: 500 }
    );
  }
}

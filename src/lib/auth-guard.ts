import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type AllowedRole = "super_admin" | "admin" | "support_staff" | "customer";

interface SessionWithRole {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Require that the current request comes from an authenticated user
 * with one of the allowed roles. Redirects to /login if unauthenticated,
 * or to /dashboard if the user lacks the required role.
 *
 * Usage in a server component or page:
 * ```ts
 * const { session } = await requireAdmin();
 * ```
 */
export async function requireAdmin(
  allowedRoles: AllowedRole[] = ["super_admin", "admin"]
): Promise<{ session: SessionWithRole }> {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as SessionWithRole | null;

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user?.role as string;

  if (!allowedRoles.includes(userRole as AllowedRole)) {
    redirect("/dashboard");
  }

  if (session.user?.banned) {
    redirect("/login");
  }

  return { session };
}

/**
 * Require super_admin role specifically — used for sensitive operations
 * like user role changes, system settings, etc.
 */
export async function requireSuperAdmin(): Promise<{ session: SessionWithRole }> {
  return requireAdmin(["super_admin"]);
}

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { twoFactor } from "better-auth/plugins/two-factor";
import { createAuthMiddleware } from "better-auth/api";
import { APIError } from "better-auth/api";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { kvGet, kvSet, kvDelete } from "@/lib/redis";
import {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/lockout";
import { createAuditLog } from "@/lib/audit";

/**
 * Custom plugin for account lockout (D-08):
 * - Before sign-in: checks if the account is locked
 * - After sign-in: records failed attempts or clears on success
 *
 * This must be a plugin because the { matcher, handler } array pattern
 * is only supported in plugin hooks, not in top-level betterAuth() hooks.
 */
const accountLockoutPlugin = {
  id: "account-lockout" as const,
  hooks: {
    before: [
      {
        matcher: (context: { path?: string }) => context.path === "/sign-in/email",
        handler: createAuthMiddleware(async (ctx) => {
          const body = ctx.body as Record<string, unknown> | undefined;
          const email = body?.email as string | undefined;
          if (email) {
            const lockoutStatus = await checkAccountLockout(email);
            if (lockoutStatus.locked) {
              throw APIError.from("FORBIDDEN", {
                code: "ACCOUNT_LOCKED",
                message: `Account temporarily locked. Try again in ${lockoutStatus.remainingMinutes} minutes.`,
              });
            }
          }
        }),
      },
    ],
    after: [
      {
        matcher: (context: { path?: string }) => context.path === "/sign-in/email",
        handler: createAuthMiddleware(async (ctx) => {
          const body = ctx.body as Record<string, unknown> | undefined;
          const email = body?.email as string | undefined;
          if (email) {
            // If there's a newSession, sign-in succeeded
            const newSession = ctx.context.newSession;
            if (newSession) {
              await clearFailedAttempts(email);
            } else {
              await recordFailedAttempt(email);
            }
          }
        }),
      },
    ],
  },
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8, // D-07: minimum 8 characters
    resetPasswordTokenExpiresIn: 3600, // D-09: 1 hour in seconds
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // D-10: 30 days in seconds
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache session in cookie for 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // Not settable during registration -- prevents mass assignment (D-02)
      },
      phone: {
        type: "string",
        required: true, // D-05: phone required at registration
      },
      centralUserId: {
        type: "string",
        required: false,
        input: false, // Set by central API integration, not by users
      },
    },
  },
  plugins: [
    admin(),
    twoFactor(),
    accountLockoutPlugin,
  ],
  secondaryStorage: {
    get: async (sessionId) => {
      const data = await kvGet(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    },
    set: async (sessionId, data, ttl) => {
      await kvSet(`session:${sessionId}`, JSON.stringify(data), ttl);
    },
    delete: async (sessionId) => {
      await kvDelete(`session:${sessionId}`);
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createAuditLog({
            actorId: user.id,
            action: "user.registered",
            targetType: "user",
            targetId: user.id,
            details: { email: user.email, name: user.name },
          });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await createAuditLog({
            actorId: session.userId,
            action: "user.login",
            targetType: "session",
            targetId: session.id,
          });

          // Clear any failed login attempts on successful login
          // session has a user property from Better Auth context
          const user = session.user as
            | { email?: string }
            | undefined;
          if (user?.email) {
            await clearFailedAttempts(user.email);
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;

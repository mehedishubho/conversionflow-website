import { Worker, Job } from "bullmq";
import { db } from "@/lib/db";
import { orders, licenses, user } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import {
  importOrderToCentral,
  mockImportOrderToCentral,
} from "@/lib/central-api";
import { createAuditLog } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import { redisConnection } from "@/jobs/redis";

/**
 * Start the BullMQ worker for the license-sync queue.
 * Returns the Worker instance, or undefined if Redis is not available.
 *
 * Handles two job types:
 * - "full_sync": Scans all completed orders without central mapping and retries sync
 * - "single_retry": Retries central API sync for a single order
 */
export function startLicenseSyncWorker(): Worker | undefined {
  try {
    const worker = new Worker(
      "license-sync",
      async (job: Job) => {
        const { type } = job.data;

        if (type === "full_sync") {
          await processFullSync(job);
        } else if (type === "single_retry") {
          await processSingleRetry(job);
        } else {
          console.warn(
            `[LicenseSync] Unknown job type: ${type} (job ${job.id})`
          );
        }
      },
      {
        connection: redisConnection,
        concurrency: 3,
        limiter: { max: 5, duration: 1000 },
      }
    );

    worker.on("failed", (failedJob, err) => {
      console.error(
        `[LicenseSync] Job ${failedJob?.id} failed: ${err.message}`
      );
    });

    worker.on("completed", (completedJob) => {
      console.log(`[LicenseSync] Job ${completedJob.id} completed`);
    });

    console.log("[LicenseSync] Worker started");
    return worker;
  } catch (error) {
    console.warn(
      "[LicenseSync] Failed to start worker (Redis not available?):",
      error instanceof Error ? error.message : error
    );
    return undefined;
  }
}

/**
 * Full sync: find all completed orders with no centralOrderId mapping
 * and retry the central API sync for each one.
 *
 * Follows the same pattern as src/app/api/ssl-commerz/ipn/route.ts steps 7-9.
 */
async function processFullSync(job: Job): Promise<void> {
  // Find completed orders that have not been synced to central API
  const pendingOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.status, "completed"), isNull(orders.centralOrderId)));

  if (pendingOrders.length === 0) {
    job.log("No pending orders to sync");
    return;
  }

  job.log(`Found ${pendingOrders.length} pending order(s) to sync`);

  let synced = 0;
  let failed = 0;

  for (const order of pendingOrders) {
    try {
      const success = await syncOrderToCentral(order);
      if (success) {
        synced++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      const msg =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[LicenseSync] Failed to sync order ${order.id}: ${msg}`
      );
      job.log(`Failed to sync order ${order.id}: ${msg}`);
    }
  }

  job.log(`Full sync complete: ${synced} synced, ${failed} failed`);
}

/**
 * Single retry: retry central API sync for a specific order.
 * Takes orderId from job.data.
 */
async function processSingleRetry(job: Job): Promise<void> {
  const { orderId } = job.data;

  if (!orderId) {
    throw new Error("Missing orderId in job data");
  }

  // Find the specific order
  const orderResults = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  const order = orderResults[0];
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.centralOrderId) {
    job.log(`Order ${orderId} already has central mapping, skipping`);
    return;
  }

  const success = await syncOrderToCentral(order);
  if (!success) {
    throw new Error(`Central API sync failed for order ${orderId}`);
  }

  job.log(`Successfully synced order ${orderId}`);
}

/**
 * Sync a single order to the central API.
 * Follows the exact pattern from IPN handler (steps 7-9).
 *
 * Returns true on success, false on failure.
 */
async function syncOrderToCentral(order: (typeof orders.$inferSelect)): Promise<boolean> {
  // Fetch user data for central API payload
  const userResults = await db
    .select()
    .from(user)
    .where(eq(user.id, order.userId))
    .limit(1);

  const orderUser = userResults[0];

  // Build central API payload (same as IPN handler step 8)
  const centralPayload = {
    orderId: order.id,
    userId: order.userId,
    userEmail: orderUser?.email || "",
    userName: orderUser?.name || "",
    userPhone: orderUser?.phone || "",
    productId: order.productId,
    plan: order.plan,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: order.paymentMethod || "unknown",
    paymentRef: order.paymentRef || null,
  };

  // Call central API or mock (same pattern as IPN handler)
  const CENTRAL_API_KEY = process.env.CENTRAL_API_KEY;
  const centralResult = CENTRAL_API_KEY
    ? await importOrderToCentral(centralPayload)
    : await mockImportOrderToCentral(centralPayload);

  if (centralResult.success && centralResult.data) {
    const centralData = centralResult.data;

    // Update order with centralOrderId
    await db
      .update(orders)
      .set({ centralOrderId: centralData.centralOrderId })
      .where(eq(orders.id, order.id));

    // Update user with centralUserId
    if (orderUser && centralData.centralUserId) {
      await db
        .update(user)
        .set({ centralUserId: centralData.centralUserId })
        .where(eq(user.id, order.userId));
    }

    // Insert license record (check for existing to avoid duplicates)
    const existingLicense = await db
      .select({ id: licenses.id })
      .from(licenses)
      .where(eq(licenses.orderId, order.id))
      .limit(1);

    if (existingLicense.length === 0) {
      await db.insert(licenses).values({
        userId: order.userId,
        orderId: order.id,
        productId: order.productId,
        plan: order.plan,
        licenseKey: centralData.licenseKey,
        status: "active",
        centralLicenseId: centralData.centralLicenseId,
      });
    }

    // Audit log for successful sync (T-06-09: never log full license keys)
    await createAuditLog({
      actorId: "system",
      actorRole: "system",
      action: "license.sync_completed",
      targetType: "order",
      targetId: order.id,
      details: {
        centralOrderId: centralData.centralOrderId,
        centralLicenseId: centralData.centralLicenseId,
        licenseKey: centralData.licenseKey.slice(0, 8) + "...",
      },
    });

    // Notify user that their license was delivered
    try {
      await sendNotification(order.userId, "license.delivered", {
        licenseKey: centralData.licenseKey,
        planName: order.plan,
        productId: order.productId,
      });
    } catch (notifError) {
      console.error("[Notifications] Failed for license.delivered:", notifError);
    }

    return true;
  } else {
    console.error(
      `[LicenseSync] Central API sync failed for order ${order.id}: ${centralResult.error}`
    );
    return false;
  }
}

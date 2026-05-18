/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the Next.js server starts. Used to initialize
 * background jobs (BullMQ schedulers and workers).
 *
 * Must use dynamic import() because instrumentation runs before
 * the module graph is fully loaded.
 *
 * Guard: only runs in Node.js runtime, not Edge.
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startJobs } = await import("@/jobs/start");
    await startJobs();
  }
}

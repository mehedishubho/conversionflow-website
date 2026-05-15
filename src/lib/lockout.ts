import { kvGet, kvSet, kvDelete } from "@/lib/redis";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes (D-08)

export interface LockoutStatus {
  locked: boolean;
  remainingMinutes?: number;
  failedAttempts: number;
}

function getLockoutKey(email: string): string {
  return `lockout:${email.toLowerCase()}`;
}

function getAttemptsKey(email: string): string {
  return `lockout:attempts:${email.toLowerCase()}`;
}

/**
 * Check if an account is currently locked out.
 * Returns lockout status including whether locked and remaining time.
 */
export async function checkAccountLockout(
  email: string,
): Promise<LockoutStatus> {
  const lockoutKey = getLockoutKey(email);
  const attemptsKey = getAttemptsKey(email);

  const lockoutData = await kvGet(lockoutKey);
  if (lockoutData) {
    const lockoutExpiry = parseInt(lockoutData, 10);
    const remainingMs = lockoutExpiry - Date.now();
    if (remainingMs > 0) {
      return {
        locked: true,
        remainingMinutes: Math.ceil(remainingMs / 60000),
        failedAttempts: MAX_FAILED_ATTEMPTS,
      };
    }
    // Lockout expired, clear it
    await kvDelete(lockoutKey);
  }

  const attemptsData = await kvGet(attemptsKey);
  const failedAttempts = attemptsData ? parseInt(attemptsData, 10) : 0;

  return {
    locked: false,
    failedAttempts,
  };
}

/**
 * Record a failed login attempt.
 * If attempts reach MAX_FAILED_ATTEMPTS, set the lockout.
 */
export async function recordFailedAttempt(
  email: string,
): Promise<LockoutStatus> {
  const attemptsKey = getAttemptsKey(email);
  const lockoutKey = getLockoutKey(email);

  const currentData = await kvGet(attemptsKey);
  const currentAttempts = currentData ? parseInt(currentData, 10) : 0;
  const newAttempts = currentAttempts + 1;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    // Lock the account for 15 minutes
    const lockoutExpiry = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
    await kvSet(lockoutKey, lockoutExpiry.toString(), LOCKOUT_DURATION_SECONDS);
    // Clear the attempts counter since lockout is active
    await kvDelete(attemptsKey);
    return {
      locked: true,
      remainingMinutes: 15,
      failedAttempts: newAttempts,
    };
  }

  // Store incremented attempt count with 1-hour TTL (auto-cleanup if no more attempts)
  await kvSet(attemptsKey, newAttempts.toString(), 3600);
  return {
    locked: false,
    failedAttempts: newAttempts,
  };
}

/**
 * Clear failed attempts on successful login.
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  const attemptsKey = getAttemptsKey(email);
  await kvDelete(attemptsKey);
}

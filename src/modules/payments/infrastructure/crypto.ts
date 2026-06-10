/**
 * AES-256-GCM Encryption Utility for Gateway Credentials
 *
 * Encrypts/decrypts gateway configuration stored in payment_gateways.config JSONB.
 * Uses Node.js built-in crypto module with AES-256-GCM authenticated encryption.
 *
 * Format: iv:tag:ciphertext (all base64 encoded)
 *
 * Requires ENCRYPTION_KEY environment variable (64-char hex string = 32 bytes = 256 bits).
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Get the encryption key from environment variable.
 * Must be a 64-character hex string (32 bytes / 256 bits).
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is required for gateway credential encryption. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Got ${key.length} characters.`
    );
  }
  return keyBuffer;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt (typically JSON.stringify of config object)
 * @returns Encrypted string in format "iv:tag:ciphertext" (all base64)
 */
export function encryptConfig(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * Decrypt an encrypted string using AES-256-GCM.
 *
 * @param encrypted - Encrypted string in format "iv:tag:ciphertext" (all base64)
 * @returns Decrypted plaintext string
 */
export function decryptConfig(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = encrypted.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted config format. Expected 'iv:tag:ciphertext' format."
    );
  }

  const [ivB64, tagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length. Expected ${IV_LENGTH}, got ${iv.length}.`);
  }
  if (tag.length !== TAG_LENGTH) {
    throw new Error(`Invalid auth tag length. Expected ${TAG_LENGTH}, got ${tag.length}.`);
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

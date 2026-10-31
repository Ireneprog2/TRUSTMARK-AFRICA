import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const codeLifetimeMs = 5 * 60 * 1000;

function verificationSecret() {
  const secret = process.env.OTP_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("OTP_SECRET must contain at least 32 bytes.");
  }
  return secret;
}

export function createVerificationCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashVerificationCode(email: string, code: string) {
  return createHmac("sha256", verificationSecret()).update(`${email}:${code}`).digest("hex");
}

export function isVerificationCodeValid(email: string, code: string, expectedHash: string) {
  const providedHash = Buffer.from(hashVerificationCode(email, code), "hex");
  const storedHash = Buffer.from(expectedHash, "hex");
  return providedHash.length === storedHash.length && timingSafeEqual(providedHash, storedHash);
}

export function verificationExpiry(from = Date.now()) {
  return new Date(from + codeLifetimeMs);
}

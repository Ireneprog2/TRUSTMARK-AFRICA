import { afterEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { createVerificationCode, hashVerificationCode, isVerificationCodeValid, verificationExpiry } from "../lib/auth/verification";
import { missingRegistrationEmailSettings } from "../lib/auth/email";
import { loginRequestSchema, registerRequestSchema, verifyRegistrationRequestSchema } from "../lib/validation/auth";

describe("authentication", () => {
  const originalOtpSecret = process.env.OTP_SECRET;

  afterEach(() => {
    if (originalOtpSecret === undefined) delete process.env.OTP_SECRET;
    else process.env.OTP_SECRET = originalOtpSecret;
  });

  it("normalizes registration and sign-in emails and validates verification codes", () => {
    expect(registerRequestSchema.parse({ name: "A Person", email: " TEST@example.com ", password: "a-secure-password" }).email).toBe("test@example.com");
    expect(loginRequestSchema.parse({ email: "TEST@example.com", password: "password" }).email).toBe("test@example.com");
    expect(verifyRegistrationRequestSchema.safeParse({ email: "test@example.com", code: "12345x" }).success).toBe(false);
  });

  it("creates six-digit codes that expire after exactly five minutes", () => {
    expect(createVerificationCode()).toMatch(/^\d{6}$/);
    expect(verificationExpiry(1_000).getTime()).toBe(301_000);
  });

  it("stores verification codes as keyed hashes and checks them safely", () => {
    process.env.OTP_SECRET = "a".repeat(32);
    const hash = hashVerificationCode("person@example.com", "123456");
    expect(hash).not.toContain("123456");
    expect(isVerificationCodeValid("person@example.com", "123456", hash)).toBe(true);
    expect(isVerificationCodeValid("person@example.com", "654321", hash)).toBe(false);
  });

  it("reports missing email settings by name without exposing their values", () => {
    const original = {
      resend: process.env.RESEND_API_KEY,
      sender: process.env.AUTH_EMAIL_FROM,
      otp: process.env.OTP_SECRET,
    };
    delete process.env.RESEND_API_KEY;
    delete process.env.AUTH_EMAIL_FROM;
    delete process.env.OTP_SECRET;

    expect(missingRegistrationEmailSettings()).toEqual([
      "RESEND_API_KEY",
      "AUTH_EMAIL_FROM",
      "OTP_SECRET (at least 32 bytes)",
    ]);

    if (original.resend === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = original.resend;
    if (original.sender === undefined) delete process.env.AUTH_EMAIL_FROM;
    else process.env.AUTH_EMAIL_FROM = original.sender;
    if (original.otp === undefined) delete process.env.OTP_SECRET;
    else process.env.OTP_SECRET = original.otp;
  });

  it("hashes passwords and rejects a different password", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).not.toContain("correct horse battery");
    await expect(verifyPassword("correct horse battery", hash)).resolves.toBe(true);
    await expect(verifyPassword("incorrect password", hash)).resolves.toBe(false);
  });
});

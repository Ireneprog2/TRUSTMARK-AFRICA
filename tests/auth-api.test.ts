import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const registrationVerification = {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
  };
  const user = { findUnique: vi.fn(), create: vi.fn() };
  return {
    createSession: vi.fn(),
    hashPassword: vi.fn(async () => "password-hash"),
    verifyPassword: vi.fn(async () => true),
    isRegistrationEmailConfigured: vi.fn(() => true),
    sendRegistrationCode: vi.fn(),
    createVerificationCode: vi.fn(() => "123456"),
    hashVerificationCode: vi.fn(() => "code-hash"),
    isVerificationCodeValid: vi.fn(() => true),
    verificationExpiry: vi.fn((from?: number) => new Date((from ?? Date.now()) + 5 * 60 * 1000)),
    consumeRateLimit: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
    prisma: {
      user,
      registrationVerification,
      $transaction: vi.fn(),
    },
  };
});

vi.mock("../lib/auth/session", () => ({ createSession: mocks.createSession }));
vi.mock("../lib/auth/password", () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));
vi.mock("../lib/auth/email", () => ({
  isRegistrationEmailConfigured: mocks.isRegistrationEmailConfigured,
  sendRegistrationCode: mocks.sendRegistrationCode,
}));
vi.mock("../lib/auth/verification", () => ({
  createVerificationCode: mocks.createVerificationCode,
  hashVerificationCode: mocks.hashVerificationCode,
  isVerificationCodeValid: mocks.isVerificationCodeValid,
  verificationExpiry: mocks.verificationExpiry,
}));
vi.mock("../lib/db/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("../lib/security/rate-limit", () => ({ consumeRateLimit: mocks.consumeRateLimit }));

import { POST as register } from "../app/api/auth/register/route";
import { POST as verify } from "../app/api/auth/verify/route";

function post(handler: (request: Request) => Promise<Response>, body: unknown) {
  return handler(new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));
}

describe("authentication API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isRegistrationEmailConfigured.mockReturnValue(true);
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.prisma.user.findUnique.mockResolvedValue(null);
    mocks.prisma.registrationVerification.findUnique.mockResolvedValue(null);
    mocks.prisma.registrationVerification.upsert.mockResolvedValue({});
    mocks.prisma.registrationVerification.deleteMany.mockResolvedValue({ count: 1 });
    mocks.prisma.registrationVerification.updateMany.mockResolvedValue({ count: 1 });
  });

  it("sends a registration code and sets its expiry to five minutes", async () => {
    const response = await post(register, {
      name: "A Person",
      email: "person@example.com",
      password: "a-secure-password",
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toContain("expires in 5 minutes");
    expect(new Date(result.expiresAt).getTime() - Date.now()).toBeGreaterThan(299_000);
    expect(new Date(result.expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(300_000);
    expect(mocks.sendRegistrationCode).toHaveBeenCalledWith("person@example.com", "123456");
  });

  it("rejects an expired code without creating an account", async () => {
    mocks.prisma.registrationVerification.findUnique.mockResolvedValue({
      email: "person@example.com",
      expiresAt: new Date(Date.now() - 1),
      attempts: 0,
    });
    const response = await post(verify, { email: "person@example.com", code: "123456" });

    expect(response.status).toBe(400);
    expect(mocks.prisma.registrationVerification.deleteMany).toHaveBeenCalledOnce();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("creates the account and session only after a valid code is consumed", async () => {
    mocks.prisma.registrationVerification.findUnique.mockResolvedValue({
      email: "person@example.com",
      displayName: "A Person",
      passwordHash: "password-hash",
      codeHash: "code-hash",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    });
    mocks.prisma.$transaction.mockImplementation(async (operation) => operation({
      registrationVerification: { deleteMany: vi.fn(async () => ({ count: 1 })) },
      user: { create: vi.fn(async () => ({ id: "user-id" })) },
    }));

    const response = await post(verify, { email: "person@example.com", code: "123456" });

    expect(response.status).toBe(200);
    expect(mocks.createSession).toHaveBeenCalledWith("user-id");
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/db/prisma", () => ({
  prisma: { communityReport: { create: vi.fn() }, alert: { findMany: vi.fn() } },
}));
vi.mock("../lib/security/rate-limit", () => ({
  consumeRateLimit: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
}));

import { GET, POST } from "../app/api/reports/route";
import { prisma } from "../lib/db/prisma";

describe("report API privacy and validation", () => {
  it("does not expose reports without authentication", async () => {
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("rejects malformed or incomplete report submissions", async () => {
    const request = new Request("http://localhost/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category: "SMS", countryCode: "RW", description: "too short" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(prisma.communityReport.create).not.toHaveBeenCalled();
  });
});
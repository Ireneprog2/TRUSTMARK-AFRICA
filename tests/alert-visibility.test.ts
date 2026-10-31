import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/db/prisma", () => ({
  prisma: { alert: { findMany: vi.fn() } },
}));

import { prisma } from "../lib/db/prisma";
import { listPublicAlerts } from "../lib/services/alerts";

const findMany = vi.mocked(prisma.alert.findMany);

describe("listPublicAlerts", () => {
  beforeEach(() => findMany.mockResolvedValue([]));

  it("only queries alerts linked to reviewed reports", async () => {
    await listPublicAlerts({ countryCode: "RW", category: "SMS", query: "mobile" });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        report: { is: { status: "REVIEWED" } },
        countryCode: "RW",
        category: "SMS",
      }),
    }));
  });

  it("selects only the sanitized public alert fields", async () => {
    await listPublicAlerts({});
    const query = findMany.mock.calls[0]?.[0];
    expect(query?.select).toEqual({
      id: true,
      title: true,
      description: true,
      category: true,
      countryCode: true,
      safetyRecommendation: true,
      reviewedAt: true,
    });
  });
});
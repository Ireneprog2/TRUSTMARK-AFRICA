import { describe, expect, it } from "vitest";
import { alertQuerySchema, createReportSchema } from "../lib/validation/report";
import { sanitizeExcerpt } from "../lib/security/sanitize";

describe("community report validation", () => {
  it("normalizes country codes and accepts an optional excerpt", () => {
    const result = createReportSchema.safeParse({
      category: "WHATSAPP",
      countryCode: "rw",
      description: "A message asked me to transfer money to claim a prize.",
      messageExcerpt: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.countryCode).toBe("RW");
  });

  it("rejects personal data payloads outside the accepted fields and oversized descriptions", () => {
    expect(createReportSchema.safeParse({
      category: "SMS",
      countryCode: "RW",
      description: "A suspicious message was received today.",
      reporterEmail: "person@example.com",
    }).success).toBe(false);
    expect(createReportSchema.safeParse({
      category: "SMS",
      countryCode: "RW",
      description: "x".repeat(2001),
    }).success).toBe(false);
  });

  it("rejects reversed alert date ranges", () => {
    expect(alertQuerySchema.safeParse({ from: "2026-10-31", to: "2026-10-01" }).success).toBe(false);
  });
});

describe("sanitizeExcerpt", () => {
  it("removes contact details, links, numbers, and credential values", () => {
    const excerpt = sanitizeExcerpt("OTP: 123456 email me at user@example.com or call +250 788 123 456 https://example.com");
    expect(excerpt).not.toContain("123456");
    expect(excerpt).not.toContain("user@example.com");
    expect(excerpt).not.toContain("+250 788 123 456");
    expect(excerpt).not.toContain("https://example.com");
    expect(excerpt).toContain("[credential removed]");
  });
});
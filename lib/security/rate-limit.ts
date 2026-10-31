import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

type RateLimitOptions = { limit: number; windowMs: number };

export async function consumeRateLimit(request: Request, { limit, windowMs }: RateLimitOptions) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) throw new Error("Rate limit secret is not configured.");

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientAddress = forwardedFor?.split(",", 1)[0]?.trim() || "unknown";
  const keyHash = createHmac("sha256", secret).update(clientAddress).digest("hex");
  const now = Date.now();
  const windowStartedAt = new Date(Math.floor(now / windowMs) * windowMs);
  const rows = await prisma.$queryRaw<Array<{ requestCount: number }>>`
    INSERT INTO "RateLimitBucket" ("keyHash", "windowStartedAt", "requestCount", "updatedAt")
    VALUES (${keyHash}, ${windowStartedAt}, 1, NOW())
    ON CONFLICT ("keyHash") DO UPDATE SET
      "requestCount" = CASE
        WHEN "RateLimitBucket"."windowStartedAt" < EXCLUDED."windowStartedAt" THEN 1
        ELSE "RateLimitBucket"."requestCount" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "RateLimitBucket"."windowStartedAt" < EXCLUDED."windowStartedAt" THEN EXCLUDED."windowStartedAt"
        ELSE "RateLimitBucket"."windowStartedAt"
      END,
      "updatedAt" = NOW()
    RETURNING "requestCount"
  `;

  const requestCount = rows[0]?.requestCount ?? limit + 1;
  return {
    allowed: requestCount <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((windowStartedAt.getTime() + windowMs - now) / 1000)),
  };
}
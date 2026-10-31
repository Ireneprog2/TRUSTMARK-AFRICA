import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security/response-headers";
import { prisma } from "@/lib/db/prisma";
import { createReportSchema } from "@/lib/validation/report";
import { sanitizeExcerpt } from "@/lib/security/sanitize";
import { readJsonBody, RequestBodyError } from "@/lib/security/read-json-body";
import { consumeRateLimit } from "@/lib/security/rate-limit";

export async function GET() {
  return NextResponse.json({ error: "Authentication is required to view reports." }, { status: 401, headers: securityHeaders });
}

export async function POST(request: Request) {
  try {
    const rateLimit = await consumeRateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Please wait before submitting another report." }, {
        status: 429,
        headers: { ...securityHeaders, "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }

    const parsed = createReportSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Report details are invalid." }, { status: 400, headers: securityHeaders });
    }

    const report = await prisma.communityReport.create({
      data: {
        category: parsed.data.category,
        countryCode: parsed.data.countryCode,
        description: parsed.data.description,
        messageExcerpt: parsed.data.messageExcerpt ? sanitizeExcerpt(parsed.data.messageExcerpt) : null,
      },
      select: { id: true, status: true, createdAt: true },
    });

    return NextResponse.json({ report }, { status: 201, headers: securityHeaders });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: securityHeaders });
    }
    return NextResponse.json({ error: "Report submission is temporarily unavailable." }, { status: 503, headers: securityHeaders });
  }
}
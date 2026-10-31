import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody, RequestBodyError } from "@/lib/security/read-json-body";
import { securityHeaders } from "@/lib/security/response-headers";
import { loginRequestSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const parsed = loginRequestSchema.safeParse(await readJsonBody(request, 5_000));
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address and password." }, { status: 400, headers: securityHeaders });
    }

    const rateLimit = await consumeRateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, {
        status: 429,
        headers: { ...securityHeaders, "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, passwordHash: true },
    });
    const valid = user?.passwordHash ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
    if (!user || !valid) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401, headers: securityHeaders });
    }

    await createSession(user.id);
    return NextResponse.json({ message: "You are signed in." }, { headers: securityHeaders });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: securityHeaders });
    }
    return NextResponse.json({ error: "Sign-in is temporarily unavailable. Please try again." }, { status: 503, headers: securityHeaders });
  }
}

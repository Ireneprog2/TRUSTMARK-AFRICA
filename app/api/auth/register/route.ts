import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { isRegistrationEmailConfigured, missingRegistrationEmailSettings, sendRegistrationCode } from "@/lib/auth/email";
import { createVerificationCode, hashVerificationCode, verificationExpiry } from "@/lib/auth/verification";
import { prisma } from "@/lib/db/prisma";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody, RequestBodyError } from "@/lib/security/read-json-body";
import { securityHeaders } from "@/lib/security/response-headers";
import { registerRequestSchema } from "@/lib/validation/auth";

const resendCooldownMs = 60 * 1000;

export async function POST(request: Request) {
  try {
    const parsed = registerRequestSchema.safeParse(await readJsonBody(request, 10_000));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Registration details are invalid." }, { status: 400, headers: securityHeaders });
    }
    if (!isRegistrationEmailConfigured()) {
      const missing = missingRegistrationEmailSettings();
      return NextResponse.json({
        error: `Email verification is not configured. Add ${missing.join(", ")} to the server environment, then restart the app.`,
      }, { status: 503, headers: securityHeaders });
    }

    const rateLimit = await consumeRateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many verification requests. Please try again later." }, {
        status: 429,
        headers: { ...securityHeaders, "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }

    const { name, email, password } = parsed.data;
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return NextResponse.json({ error: "This email is already registered. Try signing in instead." }, { status: 409, headers: securityHeaders });
    }

    const now = new Date();
    const pending = await prisma.registrationVerification.findUnique({ where: { email }, select: { lastSentAt: true } });
    const retryAfterSeconds = pending ? Math.ceil((pending.lastSentAt.getTime() + resendCooldownMs - now.getTime()) / 1000) : 0;
    if (retryAfterSeconds > 0) {
      return NextResponse.json({ error: "Please wait before requesting another code.", retryAfterSeconds }, {
        status: 429,
        headers: { ...securityHeaders, "Retry-After": String(retryAfterSeconds) },
      });
    }

    const code = createVerificationCode();
    const passwordHash = await hashPassword(password);
    await prisma.registrationVerification.upsert({
      where: { email },
      create: {
        email,
        displayName: name,
        passwordHash,
        codeHash: hashVerificationCode(email, code),
        expiresAt: verificationExpiry(now.getTime()),
        lastSentAt: now,
      },
      update: {
        displayName: name,
        passwordHash,
        codeHash: hashVerificationCode(email, code),
        expiresAt: verificationExpiry(now.getTime()),
        attempts: 0,
        lastSentAt: now,
      },
    });

    try {
      await sendRegistrationCode(email, code);
    } catch (error) {
      await prisma.registrationVerification.deleteMany({ where: { email, codeHash: hashVerificationCode(email, code) } });
      throw error;
    }

    return NextResponse.json({
      message: `A verification code has been sent to ${email}. It expires in 5 minutes.`,
      expiresAt: verificationExpiry(now.getTime()).toISOString(),
    }, { status: 200, headers: securityHeaders });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: securityHeaders });
    }
    return NextResponse.json({ error: "Registration is temporarily unavailable. Please try again." }, { status: 503, headers: securityHeaders });
  }
}

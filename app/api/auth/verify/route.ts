import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { isVerificationCodeValid } from "@/lib/auth/verification";
import { prisma } from "@/lib/db/prisma";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody, RequestBodyError } from "@/lib/security/read-json-body";
import { securityHeaders } from "@/lib/security/response-headers";
import { verifyRegistrationRequestSchema } from "@/lib/validation/auth";

const maximumAttempts = 5;

export async function POST(request: Request) {
  try {
    const parsed = verifyRegistrationRequestSchema.safeParse(await readJsonBody(request, 5_000));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Verification details are invalid." }, { status: 400, headers: securityHeaders });
    }

    const rateLimit = await consumeRateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many verification attempts. Please try again later." }, {
        status: 429,
        headers: { ...securityHeaders, "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }

    const { email, code } = parsed.data;
    const challenge = await prisma.registrationVerification.findUnique({ where: { email } });
    const now = new Date();
    if (!challenge || challenge.expiresAt <= now || challenge.attempts >= maximumAttempts) {
      if (challenge && challenge.expiresAt <= now) await prisma.registrationVerification.deleteMany({ where: { email, expiresAt: { lte: now } } });
      return NextResponse.json({ error: "That code is invalid or expired. Request a new code and try again." }, { status: 400, headers: securityHeaders });
    }

    if (!isVerificationCodeValid(email, code, challenge.codeHash)) {
      await prisma.registrationVerification.updateMany({
        where: { email, attempts: challenge.attempts, expiresAt: { gt: now } },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "That code is incorrect. Check your email and try again." }, { status: 400, headers: securityHeaders });
    }

    const user = await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.registrationVerification.deleteMany({
        where: {
          email,
          codeHash: challenge.codeHash,
          expiresAt: { gt: now },
          attempts: { lt: maximumAttempts },
        },
      });
      if (consumed.count !== 1) return null;

      return transaction.user.create({
        data: {
          email,
          passwordHash: challenge.passwordHash,
          profile: { create: { displayName: challenge.displayName } },
        },
        select: { id: true },
      });
    });

    if (!user) {
      return NextResponse.json({ error: "That code is invalid or expired. Request a new code and try again." }, { status: 400, headers: securityHeaders });
    }
    await createSession(user.id);
    return NextResponse.json({ message: "Your email is verified and your account is ready." }, { headers: securityHeaders });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: securityHeaders });
    }
    return NextResponse.json({ error: "Verification is temporarily unavailable. Please try again." }, { status: 503, headers: securityHeaders });
  }
}

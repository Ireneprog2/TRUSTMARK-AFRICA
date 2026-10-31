import { NextResponse } from "next/server";
import { answerHelp, localHelpReply, translateText } from "@/lib/ai/assistant";
import { isAIProviderConfigured } from "@/lib/ai/provider";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody, RequestBodyError } from "@/lib/security/read-json-body";
import { securityHeaders } from "@/lib/security/response-headers";
import { assistantRequestSchema } from "@/lib/validation/assistant";

export async function GET() {
  return NextResponse.json({ aiConfigured: isAIProviderConfigured() }, { headers: securityHeaders });
}

export async function POST(request: Request) {
  try {
    const parsed = assistantRequestSchema.safeParse(await readJsonBody(request, 20_000));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Request is invalid." }, { status: 400, headers: securityHeaders });
    }

    const aiConfigured = isAIProviderConfigured();
    if (aiConfigured && !parsed.data.consentToExternalProcessing) {
      return NextResponse.json({ error: "Consent is required before text is sent to the configured AI provider." }, { status: 400, headers: securityHeaders });
    }

    if (aiConfigured) {
      const rateLimit = await consumeRateLimit(request, { limit: 12, windowMs: 60 * 60 * 1000 });
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Assistant limit reached. Please try again later." }, {
          status: 429,
          headers: { ...securityHeaders, "Retry-After": String(rateLimit.retryAfterSeconds) },
        });
      }
    }

    if (parsed.data.task === "translate" && !aiConfigured) {
      return NextResponse.json({ error: "Translation requires an AI provider. Configure AI_API_KEY and AI_MODEL on the server." }, { status: 503, headers: securityHeaders });
    }

    let response: string;
    if (!aiConfigured) {
      if (parsed.data.task !== "help") {
        return NextResponse.json({ error: "Translation requires an AI provider." }, { status: 503, headers: securityHeaders });
      }
      response = localHelpReply(parsed.data.text, parsed.data.language);
    } else if (parsed.data.task === "help") {
      response = await answerHelp(parsed.data.text, parsed.data.language);
    } else {
      response = await translateText(parsed.data.text, parsed.data.sourceLanguage, parsed.data.targetLanguage);
    }

    return NextResponse.json({ response, source: aiConfigured ? "ai" : "local" }, { headers: securityHeaders });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: securityHeaders });
    }
    return NextResponse.json({ error: "Assistant is temporarily unavailable." }, { status: 503, headers: securityHeaders });
  }
}
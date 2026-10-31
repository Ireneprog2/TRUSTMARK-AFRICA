import { NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/ai/analyze";
import { securityHeaders } from "@/lib/security/response-headers";
import { analyzeRequestSchema } from "@/lib/validation/analyze";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message." }, { status: 400, headers: securityHeaders });
    }
    return NextResponse.json(analyzeMessage(parsed.data.message), { headers: securityHeaders });
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400, headers: securityHeaders });
  }
}
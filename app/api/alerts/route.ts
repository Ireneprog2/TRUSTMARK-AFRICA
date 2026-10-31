import { NextResponse } from "next/server";
import { listPublicAlerts } from "@/lib/services/alerts";
import { securityHeaders } from "@/lib/security/response-headers";
import { alertQuerySchema } from "@/lib/validation/report";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = alertQuerySchema.safeParse({
    countryCode: searchParams.get("countryCode") || undefined,
    category: searchParams.get("category") || undefined,
    query: searchParams.get("query") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Alert filters are invalid." }, { status: 400, headers: securityHeaders });
  }

  try {
    const alerts = await listPublicAlerts(parsed.data);
    return NextResponse.json({ alerts }, { headers: securityHeaders });
  } catch {
    return NextResponse.json({ error: "Alerts are temporarily unavailable." }, { status: 503, headers: securityHeaders });
  }
}
const resendEndpoint = "https://api.resend.com/emails";

export function missingRegistrationEmailSettings() {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
  if (!process.env.AUTH_EMAIL_FROM?.trim()) missing.push("AUTH_EMAIL_FROM");
  if (!process.env.OTP_SECRET || Buffer.byteLength(process.env.OTP_SECRET) < 32) missing.push("OTP_SECRET (at least 32 bytes)");
  return missing;
}

export function isRegistrationEmailConfigured() {
  return missingRegistrationEmailSettings().length === 0;
}

export async function sendRegistrationCode(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Registration email is not configured.");

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your TrustMark Africa verification code",
      text: `Your TrustMark Africa verification code is ${code}. It expires in 5 minutes. If you did not request this, you can ignore this email.`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error("Registration verification email could not be sent.");
}

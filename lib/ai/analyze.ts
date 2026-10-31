export type AnalysisSignal = {
  label: string;
  explanation: string;
  weight: number;
};

export type AnalysisResult = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  signals: AnalysisSignal[];
  summary: string;
  recommendedActions: string[];
  method: "rule_based";
  confidenceNote: string;
};

const patterns: Array<{ pattern: RegExp; label: string; explanation: string; weight: number }> = [
  { pattern: /\b(urgent|immediately|act now|within 24 hours|today only)\b/i, label: "Urgency or pressure", explanation: "The message pressures you to act quickly, which can make independent verification harder.", weight: 14 },
  { pattern: /\b(password|pin|one[- ]time password|one[- ]time code|otp|verification code)\b/i, label: "Authentication details", explanation: "The message refers to credentials or verification codes. Do not share passwords, PINs, or OTPs with anyone who contacts you.", weight: 48 },
  { pattern: /\b(send|transfer|pay|deposit)\b.{0,55}\b(money|cash|fee|funds|wallet|mobile money)\b|\b(money|cash|fee|funds|wallet|mobile money)\b.{0,55}\b(send|transfer|pay|deposit)\b/i, label: "Payment request", explanation: "The message asks for a payment or transfer. Verify the recipient and reason through a separate trusted channel before paying.", weight: 26 },
  { pattern: /\b(prize|winner|giveaway|claim your reward|you have won)\b/i, label: "Unexpected reward", explanation: "Unexpected prizes can be used to prompt payment or disclosure of personal details. Verify the promotion with the organization directly.", weight: 22 },
  { pattern: /\b(account|bank|mobile money|wallet)\b.{0,45}\b(suspend|locked|close|blocked|verify now)\b/i, label: "Account threat", explanation: "An account warning can be used to push you toward a fake sign-in page. Check through the official app or website you normally use.", weight: 24 },
  { pattern: /https?:\/\/|www\./i, label: "Link included", explanation: "A link is present. Its appearance alone does not establish safety; avoid signing in through unexpected links.", weight: 10 },
  { pattern: /\b(official|police|bank|revenue authority|telecom|mobile money)\b.{0,60}\b(verify|suspend|locked|urgent|code|pin)\b/i, label: "Possible authority impersonation", explanation: "The message combines an authority or service identity with a demand. Contact the organization using details you find independently.", weight: 24 },
  { pattern: /\b(guaranteed returns?|double your money|risk[- ]free investment|upfront (job|registration) fee)\b/i, label: "Unusually certain offer", explanation: "Guaranteed returns or fees to access an opportunity deserve extra scrutiny. Check independent records and never pay under pressure.", weight: 28 },
];

export function analyzeMessage(message: string): AnalysisResult {
  const signals = patterns
    .filter(({ pattern }) => pattern.test(message))
    .map(({ label, explanation, weight }) => ({ label, explanation, weight }));
  const score = Math.min(100, signals.reduce((total, signal) => total + signal.weight, 0));
  const riskLevel = score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
  const recommendedActions = riskLevel === "HIGH"
    ? ["Do not send money or share codes or passwords.", "Contact the named organization using a number or app you already trust.", "If you already acted, contact your bank or mobile-money provider promptly."]
    : riskLevel === "MEDIUM"
      ? ["Pause before responding, clicking, or paying.", "Verify the request independently through an official channel.", "Never share an OTP, PIN, or password."]
      : ["No matching warning patterns were found; that does not prove the message is safe.", "Verify unexpected requests through a separate trusted channel."];

  return {
    riskLevel,
    score,
    signals,
    summary: signals.length
      ? "These indicators can appear in suspicious messages, but they are not proof of fraud. Review each signal and verify claims independently."
      : "No matching warning patterns were found. This check cannot verify a sender, link, or claim.",
    recommendedActions,
    method: "rule_based",
    confidenceNote: "This is a limited keyword-based screen, not an AI verdict or probability. Context, language variation, and new scam patterns can affect results.",
  };
}
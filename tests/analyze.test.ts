import { describe, expect, it } from "vitest";
import { analyzeMessage } from "../lib/ai/analyze";

describe("analyzeMessage", () => {
  it("flags pressure and payment language", () => {
    const result = analyzeMessage("Act now and transfer money to claim your account.");
    expect(result.riskLevel).toBe("MEDIUM");
    expect(result.signals.map(({ label }) => label)).toContain("Urgency or pressure");
    expect(result.signals.map(({ label }) => label)).toContain("Payment request");
  });

  it("flags credential requests as high risk without treating the score as certainty", () => {
    const result = analyzeMessage("Urgent: send your OTP and password now.");
    expect(result.riskLevel).toBe("HIGH");
    expect(result.recommendedActions[0]).toContain("Do not send");
    expect(result.confidenceNote).toContain("not an AI verdict");
  });

  it("does not claim to verify a message without matching patterns", () => {
    const result = analyzeMessage("The meeting is at 10 tomorrow.");
    expect(result.riskLevel).toBe("LOW");
    expect(result.score).toBe(0);
    expect(result.summary).toContain("cannot verify");
    expect(result.recommendedActions[0]).toContain("does not prove");
  });
});
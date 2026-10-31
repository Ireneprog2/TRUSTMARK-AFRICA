import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/ai/provider", () => ({
  isAIProviderConfigured: vi.fn(() => false),
}));
vi.mock("../lib/ai/assistant", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/ai/assistant")>();
  return {
    ...actual,
    answerHelp: vi.fn(async () => "AI help answer"),
    translateText: vi.fn(async () => "AI translation"),
  };
});
vi.mock("../lib/security/rate-limit", () => ({
  consumeRateLimit: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
}));

import { GET, POST } from "../app/api/assistant/route";
import { answerHelp, translateText } from "../lib/ai/assistant";
import { isAIProviderConfigured } from "../lib/ai/provider";
import { consumeRateLimit } from "../lib/security/rate-limit";

function post(body: unknown) {
  return POST(new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));
}

describe("assistant API", () => {
  beforeEach(() => {
    vi.mocked(isAIProviderConfigured).mockReturnValue(false);
    vi.mocked(answerHelp).mockClear();
    vi.mocked(translateText).mockClear();
    vi.mocked(consumeRateLimit).mockClear();
  });

  it("reports provider availability without exposing configuration", async () => {
    const response = await GET();
    expect(await response.json()).toEqual({ aiConfigured: false });
  });

  it("answers common help locally when no provider is configured", async () => {
    const response = await post({ task: "help", text: "Should I share an OTP?", language: "en" });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ source: "local" });
    expect(answerHelp).not.toHaveBeenCalled();
  });

  it("does not invent a translation when no provider is configured", async () => {
    const response = await post({ task: "translate", text: "Muraho", sourceLanguage: "rw", targetLanguage: "en" });
    expect(response.status).toBe(503);
    expect(translateText).not.toHaveBeenCalled();
  });

  it("translates only after consent and rate limits the provider request", async () => {
    vi.mocked(isAIProviderConfigured).mockReturnValue(true);
    const noConsent = await post({ task: "translate", text: "Muraho", sourceLanguage: "auto", targetLanguage: "en" });
    expect(noConsent.status).toBe(400);
    expect(translateText).not.toHaveBeenCalled();
    expect(consumeRateLimit).not.toHaveBeenCalled();

    const withConsent = await post({
      task: "translate",
      text: "Muraho",
      sourceLanguage: "auto",
      targetLanguage: "en",
      consentToExternalProcessing: true,
    });
    expect(withConsent.status).toBe(200);
    expect(await withConsent.json()).toMatchObject({ response: "AI translation", source: "ai" });
    expect(translateText).toHaveBeenCalledWith("Muraho", "auto", "en");
    expect(consumeRateLimit).toHaveBeenCalledOnce();
  });

  it("requires consent and rate limits requests when an AI provider is configured", async () => {
    vi.mocked(isAIProviderConfigured).mockReturnValue(true);
    const noConsent = await post({ task: "help", text: "How do I report a message?", language: "en" });
    expect(noConsent.status).toBe(400);
    expect(consumeRateLimit).not.toHaveBeenCalled();

    const withConsent = await post({ task: "help", text: "How do I report a message?", language: "en", consentToExternalProcessing: true });
    expect(withConsent.status).toBe(200);
    expect(await withConsent.json()).toMatchObject({ response: "AI help answer", source: "ai" });
    expect(consumeRateLimit).toHaveBeenCalledOnce();
  });
});
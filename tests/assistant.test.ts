import { describe, expect, it } from "vitest";
import { localHelpReply } from "../lib/ai/assistant";
import { assistantRequestSchema } from "../lib/validation/assistant";

describe("assistant request validation", () => {
  it("accepts support questions in the supported languages", () => {
    expect(assistantRequestSchema.safeParse({ task: "help", text: "How do I report a message?", language: "en" }).success).toBe(true);
    expect(assistantRequestSchema.safeParse({ task: "help", text: "Ni gute natanga raporo?", language: "rw" }).success).toBe(true);
    expect(assistantRequestSchema.safeParse({ task: "help", text: "Comment signaler un message?", language: "fr" }).success).toBe(true);
  });

  it("rejects same-language translation and unknown language codes", () => {
    expect(assistantRequestSchema.safeParse({ task: "translate", text: "Hello", sourceLanguage: "en", targetLanguage: "en" }).success).toBe(false);
    expect(assistantRequestSchema.safeParse({ task: "help", text: "Help me", language: "sw" }).success).toBe(false);
  });

  it("answers common credential-safety questions in Kinyarwanda, English, and French", () => {
    expect(localHelpReply("Should I share an OTP?", "rw")).toContain("Ntugasangize");
    expect(localHelpReply("Should I share an OTP?", "en")).toContain("Never share");
    expect(localHelpReply("Dois-je partager un OTP?", "fr")).toContain("Ne communiquez jamais");
  });
});
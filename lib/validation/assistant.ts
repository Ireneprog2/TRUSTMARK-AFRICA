import { z } from "zod";

const languageSchema = z.enum(["en", "rw", "fr"]);

export const assistantRequestSchema = z.discriminatedUnion("task", [
  z.object({
    task: z.literal("help"),
    text: z.string().trim().min(2).max(4000),
    language: languageSchema,
    consentToExternalProcessing: z.boolean().default(false),
  }).strict(),
  z.object({
    task: z.literal("translate"),
    text: z.string().trim().min(1).max(4000),
    sourceLanguage: z.enum(["auto", "en", "rw", "fr"]),
    targetLanguage: languageSchema,
    consentToExternalProcessing: z.boolean().default(false),
  }).strict().refine((value) => value.sourceLanguage === "auto" || value.sourceLanguage !== value.targetLanguage, {
    message: "Choose a different target language.",
    path: ["targetLanguage"],
  }),
]);
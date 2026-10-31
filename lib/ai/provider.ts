import { z } from "zod";

const completionSchema = z.object({
  choices: z.array(z.object({
    message: z.object({ content: z.string() }),
  })).min(1),
});

export function isAIProviderConfigured() {
  return Boolean(process.env.AI_API_KEY && process.env.AI_MODEL);
}

export async function requestAI(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  if (!apiKey || !model) throw new Error("AI provider is not configured.");

  const endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/chat/completions`);
  const isLocalDevelopment = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(endpoint.hostname);
  if (endpoint.protocol !== "https:" && !isLocalDevelopment) {
    throw new Error("AI provider must use HTTPS.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("AI provider request failed.");

  const parsed = completionSchema.safeParse(await response.json());
  const content = parsed.success ? parsed.data.choices[0]?.message.content.trim() : "";
  if (!content) throw new Error("AI provider returned an invalid response.");
  return content;
}
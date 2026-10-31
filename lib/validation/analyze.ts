import { z } from "zod";

export const analyzeRequestSchema = z.object({
  message: z.string().trim().min(1, "Enter a message to analyze.").max(5000, "Message must be 5,000 characters or fewer."),
});
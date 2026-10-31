import { z } from "zod";

export const reportCategorySchema = z.enum([
  "SMS",
  "WHATSAPP",
  "EMAIL",
  "PHONE_CALL",
  "WEBSITE",
  "SOCIAL_MEDIA",
  "MOBILE_MONEY",
  "OTHER",
]);

export const createReportSchema = z.object({
  category: reportCategorySchema,
  countryCode: z.string().trim().regex(/^[A-Za-z]{2}$/, "Choose a valid country." ).transform((value) => value.toUpperCase()),
  description: z.string().trim().min(20, "Add at least 20 characters describing what happened.").max(2000, "Description must be 2,000 characters or fewer."),
  messageExcerpt: z.string().trim().max(500, "Excerpt must be 500 characters or fewer.").optional().or(z.literal("")),
}).strict();

export const alertQuerySchema = z.object({
  countryCode: z.string().trim().regex(/^[A-Za-z]{2}$/).transform((value) => value.toUpperCase()).optional(),
  category: reportCategorySchema.optional(),
  query: z.string().trim().max(80).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine(({ from, to }) => !from || !to || from <= to, {
  message: "Start date must be earlier than end date.",
});
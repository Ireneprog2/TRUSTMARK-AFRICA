import { z } from "zod";

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());

export const registerRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: z.string().min(10).max(128),
}).strict();

export const verifyRegistrationRequestSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code."),
}).strict();

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
}).strict();

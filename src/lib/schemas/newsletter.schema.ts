import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_SUBMISSION_AGE_MS = 24 * 60 * 60 * 1000;

export const newsletterInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "E-posta adresi cok kisa.")
    .max(254, "E-posta adresi cok uzun.")
    .regex(EMAIL_REGEX, "Gecerli bir e-posta adresi giriniz."),

  _hp: z.string().max(0, "Bot algilandi.").optional().default(""),
  _t: z.number().int().positive(),
});

export type NewsletterInput = z.infer<typeof newsletterInputSchema>;

export function isSubmissionTimingInvalid(renderTimestamp: number): boolean {
  const elapsed = Date.now() - renderTimestamp;
  return elapsed < 2000 || elapsed > MAX_SUBMISSION_AGE_MS;
}

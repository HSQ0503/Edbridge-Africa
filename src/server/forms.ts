import { z } from "zod";
import { HONEYPOT_FIELD, TURNSTILE_FIELD, type FormState, type FormValues } from "@/lib/form-state";
import { recordSubmission, type IntakeKind } from "./intake";
import { allowFormSubmission, getClientIp } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";

function formDataToValues(formData: FormData): FormValues {
  const values: FormValues = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || typeof value !== "string") continue;
    const existing = values[key];
    if (existing === undefined) values[key] = value;
    else values[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return values;
}

function formError(message: string, values: FormValues): FormState {
  return { status: "error", message, fieldErrors: {}, values };
}

// Cheapest checks first: honeypot (no I/O), rate limit (one query), validation, then Turnstile (a network call).
export async function handleSubmission(kind: IntakeKind, schema: z.ZodType, formData: FormData): Promise<FormState> {
  const values = formDataToValues(formData);
  if (values[HONEYPOT_FIELD]) return { status: "success" };
  const turnstileToken = values[TURNSTILE_FIELD];
  delete values[HONEYPOT_FIELD];
  delete values[TURNSTILE_FIELD];

  const ip = await getClientIp();
  if (!(await allowFormSubmission(ip))) {
    return formError(
      "You've sent a lot of forms in a short time. Please try again in an hour, or contact us by phone or email.",
      values,
    );
  }

  const result = schema.safeParse(values);
  if (!result.success) {
    return {
      status: "error",
      message: "There is a problem with your answers",
      fieldErrors: z.flattenError(result.error).fieldErrors as Record<string, string[]>,
      values,
    };
  }

  if (!(await verifyTurnstile(typeof turnstileToken === "string" ? turnstileToken : "", ip))) {
    return formError(
      "We couldn't confirm this form was sent by a person. Please try again, or contact us by phone or email.",
      values,
    );
  }

  const saved = await recordSubmission(kind, result.data as Record<string, unknown>);
  if (!saved.ok) {
    return formError("We couldn't send your form right now. Please try again later, or contact us by phone or email.", values);
  }
  return { status: "success", reference: saved.reference };
}

// Reusable field rules so every form words its errors the same way.
export const fields = {
  requiredText: (error: string, max = 200) => z.string().trim().min(1, { error }).max(max, { error: `Keep this under ${max} characters` }),
  optionalText: (max = 200) => z.string().trim().max(max, { error: `Keep this under ${max} characters` }).optional(),
  email: () =>
    z
      .string()
      .trim()
      .min(1, { error: "Enter your email address" })
      .pipe(z.email({ error: "Enter an email address in the correct format, like name@example.com" })),
  optionalEmail: () =>
    z.union([z.literal(""), z.string().trim().pipe(z.email({ error: "Enter an email address in the correct format, like name@example.com" }))]).optional(),
  phone: (error = "Enter a phone number, like 024 123 4567 or +233 24 123 4567") =>
    z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, { error }),
  optionalPhone: () =>
    z.union([z.literal(""), z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, { error: "Enter a phone number, like 024 123 4567 or +233 24 123 4567" })]).optional(),
  confirmed: (error: string) => z.literal("yes", { error }),
  choice: <const T extends readonly [string, ...string[]]>(options: T, error: string) => z.enum(options, { error }),
  choices: <const T extends readonly [string, ...string[]]>(options: T, error?: string) =>
    z.preprocess(
      (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
      error ? z.array(z.enum(options)).min(1, { error }) : z.array(z.enum(options)),
    ),
};

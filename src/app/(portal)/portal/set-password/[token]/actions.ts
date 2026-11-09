"use server";

import { APIError } from "better-auth/api";
import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { recordAuditEvent } from "@/server/audit";
import { auth } from "@/server/auth";
import { passwordLinkUser } from "@/server/staff-accounts";

const EXPIRED = "This link has expired or has already been used. Ask a staff admin to send you a new one.";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(12, { error: "Use at least 12 characters" })
      .max(128, { error: "Keep your password under 128 characters" }),
    confirm: z.string(),
  })
  .refine(({ password, confirm }) => password === confirm, { path: ["confirm"], error: "The two passwords don't match" });

export async function setPassword(token: string, _state: FormState, formData: FormData): Promise<FormState> {
  const userId = await passwordLinkUser(token);
  if (!userId) return { status: "error", message: EXPIRED, fieldErrors: {}, values: {} };

  const parsed = passwordSchema.safeParse({ password: formData.get("password") ?? "", confirm: formData.get("confirm") ?? "" });
  if (!parsed.success) {
    // Passwords are never sent back to the browser, even to refill the form.
    return { status: "error", message: "There is a problem", fieldErrors: z.flattenError(parsed.error).fieldErrors, values: {} };
  }

  try {
    await auth.api.resetPassword({ body: { newPassword: parsed.data.password, token } });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return { status: "error", message: EXPIRED, fieldErrors: {}, values: {} };
  }
  await recordAuditEvent({ actorId: userId, action: "staff.password_set" });
  return { status: "success" };
}

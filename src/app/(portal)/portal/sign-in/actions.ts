"use server";

import { createHash } from "node:crypto";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { recordAuditEvent } from "@/server/audit";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { fields } from "@/server/forms";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

const signInSchema = z.object({
  email: fields.email(),
  password: z.string().min(1, { error: "Enter your password" }),
});

function formError(message: string, values: Record<string, string> = {}): FormState {
  return { status: "error", message, fieldErrors: {}, values };
}

// Failed attempts are counted per address, hashed so the audit log doesn't collect mistyped emails.
function emailKey(email: string) {
  return createHash("sha256").update(email.toLowerCase()).digest("hex");
}

export async function signIn(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const parsed = signInSchema.safeParse({ email, password: formData.get("password") ?? "" });
  if (!parsed.success) {
    return {
      status: "error",
      message: "There is a problem",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      values: { email },
    };
  }

  const key = emailKey(parsed.data.email);
  const recentFailures = await prisma.auditEvent.count({
    where: { action: "staff.sign_in_failed", targetId: key, occurredAt: { gte: new Date(Date.now() - LOCKOUT_WINDOW_MS) } },
  });
  if (recentFailures >= MAX_FAILED_ATTEMPTS) {
    return formError("Too many failed attempts. Wait 15 minutes, then try again.", { email });
  }

  let result: Awaited<ReturnType<typeof auth.api.signInEmail>>;
  try {
    // rememberMe: false gives a browser-session cookie, so closing the browser signs staff out.
    result = await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password, rememberMe: false },
      headers: await headers(),
    });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    await recordAuditEvent({ actorId: null, action: "staff.sign_in_failed", targetType: "email", targetId: key });
    return formError("Your email address or password is incorrect", { email });
  }

  if ("twoFactorRedirect" in result) redirect("/portal/sign-in/code");
  await recordAuditEvent({ actorId: result.user.id, action: "staff.signed_in", detail: { mfa: false } });
  redirect("/portal/set-up-mfa");
}

export async function verifyCode(_state: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!code) {
    return { status: "error", message: "There is a problem", fieldErrors: { code: ["Enter the code"] }, values: {} };
  }

  let userId: string;
  try {
    const request = { body: { code }, headers: await headers() };
    // Authenticator codes are 6 digits; anything else is treated as a backup code.
    const result = /^\d{6}$/.test(code) ? await auth.api.verifyTOTP(request) : await auth.api.verifyBackupCode(request);
    userId = result.user.id;
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    if (error.body?.code === "INVALID_TWO_FACTOR_COOKIE") redirect("/portal/sign-in");
    if (error.body?.code === "ACCOUNT_TEMPORARILY_LOCKED" || error.body?.code === "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE") {
      return formError("Too many incorrect codes. Sign in again in a few minutes.");
    }
    return formError("That code didn't work. Check it and try again — codes change every 30 seconds.");
  }

  await recordAuditEvent({ actorId: userId, action: "staff.signed_in", detail: { mfa: true } });
  redirect("/portal");
}

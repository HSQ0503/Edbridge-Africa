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
import { getStaff } from "@/server/staff";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_CODES_SENT = 5;

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

async function checkPassword(email: string, password: string) {
  try {
    // rememberMe: false gives a browser-session cookie, so closing the browser signs staff out.
    return await auth.api.signInEmail({
      body: { email, password, rememberMe: false },
      headers: await headers(),
      returnHeaders: true,
    });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return null;
  }
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
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  // Codes are capped too: each one allows a few guesses, so unlimited codes would allow unlimited guessing.
  const [recentFailures, recentCodes] = await Promise.all([
    prisma.auditEvent.count({ where: { action: "staff.sign_in_failed", targetId: key, occurredAt: { gte: since } } }),
    prisma.auditEvent.count({ where: { action: "staff.sign_in_code_sent", targetId: key, occurredAt: { gte: since } } }),
  ]);
  if (recentFailures >= MAX_FAILED_ATTEMPTS || recentCodes >= MAX_CODES_SENT) {
    return formError("Too many sign-in attempts. Wait 15 minutes, then try again.", { email });
  }

  const signedIn = await checkPassword(parsed.data.email, parsed.data.password);
  if (!signedIn) {
    await recordAuditEvent({ actorId: null, action: "staff.sign_in_failed", targetType: "email", targetId: key });
    return formError("Your email address or password is incorrect", { email });
  }

  // Someone who hasn't confirmed a code yet gets a password-only session, which can do nothing but confirm one.
  if (!("twoFactorRedirect" in signedIn.response)) {
    await recordAuditEvent({ actorId: signedIn.response.user.id, action: "staff.signed_in", detail: { mfa: false } });
  }
  // The cookie that identifies this sign-in was only just set, so the request doesn't carry it yet.
  const cookie = signedIn.headers
    .getSetCookie()
    .map((setCookie) => setCookie.split(";")[0])
    .join("; ");
  await auth.api.sendTwoFactorOTP({ headers: new Headers({ cookie }) });
  await recordAuditEvent({ actorId: null, action: "staff.sign_in_code_sent", targetType: "email", targetId: key });
  redirect("/portal/sign-in/code");
}

export async function verifyCode(_state: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { status: "error", message: "There is a problem", fieldErrors: { code: ["Enter the 6-digit code"] }, values: {} };
  }

  const firstCode = (await getStaff())?.mfaEnabled === false;
  let userId: string;
  try {
    const result = await auth.api.verifyTwoFactorOTP({ body: { code }, headers: await headers() });
    userId = result.user.id;
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    if (error.body?.code === "INVALID_TWO_FACTOR_COOKIE") redirect("/portal/sign-in");
    if (error.body?.code === "OTP_HAS_EXPIRED" || error.body?.code === "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE") {
      return formError("That code has expired or been tried too many times. Start again to get a new one.");
    }
    return formError("That code didn't work. Check it against the newest email and try again.");
  }

  if (firstCode) await recordAuditEvent({ actorId: userId, action: "staff.mfa_enabled" });
  await recordAuditEvent({ actorId: userId, action: "staff.signed_in", detail: { mfa: true } });
  redirect("/portal");
}

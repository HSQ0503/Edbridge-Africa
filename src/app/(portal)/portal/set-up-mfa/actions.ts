"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { renderSVG } from "uqr";
import type { FormState } from "@/lib/form-state";
import { recordAuditEvent } from "@/server/audit";
import { auth } from "@/server/auth";
import { getStaff } from "@/server/staff";

export type MfaSetupState = FormState | { status: "ready"; qrSvg: string; setupKey: string; backupCodes: string[] };

function fieldError(name: string, message: string): FormState {
  return { status: "error", message: "There is a problem", fieldErrors: { [name]: [message] }, values: {} };
}

export async function startMfaSetup(_state: MfaSetupState, formData: FormData): Promise<MfaSetupState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return fieldError("password", "Enter your password");

  const staff = await getStaff();
  if (!staff) redirect("/portal/sign-in");
  if (staff.mfaEnabled) redirect("/portal");

  let result: Awaited<ReturnType<typeof auth.api.enableTwoFactor>>;
  try {
    // Starting again before confirming replaces the earlier secret and backup codes.
    result = await auth.api.enableTwoFactor({ body: { password }, headers: await headers() });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    if (error.body?.code === "INVALID_PASSWORD") return fieldError("password", "Your password is incorrect");
    redirect("/portal/sign-in");
  }
  if (!("totpURI" in result)) redirect("/portal");

  return {
    status: "ready",
    qrSvg: renderSVG(result.totpURI),
    setupKey: new URL(result.totpURI).searchParams.get("secret") ?? "",
    backupCodes: result.backupCodes,
  };
}

export async function confirmMfaSetup(_state: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return fieldError("code", "Enter the 6-digit code from your authenticator app");

  const staff = await getStaff();
  if (!staff) redirect("/portal/sign-in");

  try {
    await auth.api.verifyTOTP({ body: { code }, headers: await headers() });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return fieldError("code", "That code didn't work. Check your app shows EdBridge Africa, then try the newest code.");
  }

  await recordAuditEvent({ actorId: staff.id, action: "staff.mfa_enabled" });
  redirect("/portal");
}

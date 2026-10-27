import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaff } from "@/server/staff";
import { MfaSetup } from "./mfa-setup";

export const metadata: Metadata = { title: "Set up two-step verification" };

export const instant = false;

export default async function SetUpMfaPage() {
  const staff = await getStaff();
  if (!staff) redirect("/portal/sign-in");
  if (staff.mfaEnabled) redirect("/portal");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Set up two-step verification</h1>
      <p>
        The portal holds sensitive information about children and families, so every account needs a code from an
        authenticator app as well as a password. This takes about two minutes.
      </p>
      <MfaSetup />
    </div>
  );
}

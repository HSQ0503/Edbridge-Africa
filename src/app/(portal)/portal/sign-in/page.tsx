import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { getStaff } from "@/server/staff";
import { signIn } from "./actions";

export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  const staff = await getStaff();
  if (staff) redirect(staff.mfaEnabled ? "/portal" : "/portal/set-up-mfa");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p>This portal is for EdBridge Africa staff. You will be signed out after 30 minutes without activity.</p>
      <FormShell action={signIn} submitLabel="Sign in" pendingLabel="Signing in…" botProtection={false}>
        <TextField name="email" label="Email address" type="email" required autoComplete="username" />
        <TextField name="password" label="Password" type="password" required autoComplete="current-password" />
      </FormShell>
      <p className="text-base text-muted">
        Forgotten your password or lost your authenticator app? Contact the IT team to reset your account.
      </p>
    </div>
  );
}

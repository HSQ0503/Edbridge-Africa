import type { Metadata } from "next";
import Link from "next/link";
import { TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { verifyCode } from "../actions";

export const metadata: Metadata = { title: "Enter your code" };

export default function SignInCodePage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-bold">Enter your code</h1>
      <p>Open your authenticator app and enter the 6-digit code for EdBridge Africa.</p>
      <FormShell action={verifyCode} submitLabel="Continue" pendingLabel="Checking…" botProtection={false}>
        <TextField
          name="code"
          label="Code"
          hint="If you don't have your phone, enter one of your backup codes instead"
          required
          autoComplete="one-time-code"
          className="sm:max-w-xs"
        />
      </FormShell>
      <p className="text-base">
        <Link href="/portal/sign-in" className="font-semibold text-brand underline">
          Start again
        </Link>
      </p>
    </div>
  );
}

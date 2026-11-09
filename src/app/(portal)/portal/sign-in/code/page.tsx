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
      <p>We&apos;ve emailed you a 6-digit code. It expires in 10 minutes.</p>
      <FormShell action={verifyCode} submitLabel="Continue" pendingLabel="Checking…" botProtection={false}>
        <TextField
          name="code"
          label="Code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          className="sm:max-w-xs"
        />
      </FormShell>
      <p className="text-base">
        Not arrived after a minute? Check your spam folder, or{" "}
        <Link href="/portal/sign-in" className="font-semibold text-brand underline">
          start again
        </Link>{" "}
        to get a new code.
      </p>
    </div>
  );
}

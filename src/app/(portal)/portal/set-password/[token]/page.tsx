import type { Metadata } from "next";
import Link from "next/link";
import { TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { Notice } from "@/components/notice";
import { passwordLinkUser } from "@/server/staff-accounts";
import { setPassword } from "./actions";

export const instant = false;

export const metadata: Metadata = { title: "Choose your password" };

export default async function SetPasswordPage({ params }: PageProps<"/portal/set-password/[token]">) {
  const { token } = await params;
  const linkWorks = (await passwordLinkUser(token)) !== null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-bold">Choose your password</h1>
      {linkWorks ? (
        <>
          <p>Use at least 12 characters. Three or four random words make a strong password that&apos;s easy to type.</p>
          <FormShell
            action={setPassword.bind(null, token)}
            submitLabel="Save password"
            pendingLabel="Saving…"
            successTitle="Your password is saved"
            successMessage="Sign in with your email address and new password. We'll email you a code to finish signing in."
            botProtection={false}
          >
            <TextField name="password" label="New password" type="password" required autoComplete="new-password" />
            <TextField name="confirm" label="Type it again" type="password" required autoComplete="new-password" />
          </FormShell>
        </>
      ) : (
        <Notice title="This link has expired or has already been used">
          <p>Ask a staff admin to send you a new one. Only the newest link works.</p>
        </Notice>
      )}
      <p className="text-base">
        <Link href="/portal/sign-in" className="font-semibold text-brand underline">
          Go to sign in
        </Link>
      </p>
    </div>
  );
}

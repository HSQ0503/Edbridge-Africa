"use client";

import { useActionState, useEffect } from "react";
import { buttonClass } from "@/components/button-link";
import { TextField } from "@/components/form/fields";
import { FormContext, FormShell } from "@/components/form/form-shell";
import { Notice } from "@/components/notice";
import { initialFormState } from "@/lib/form-state";
import { confirmMfaSetup, startMfaSetup, type MfaSetupState } from "./actions";

// The secret and backup codes exist only in this component's state: they are never shown again after setup.
export function MfaSetup() {
  const [state, action, pending] = useActionState<MfaSetupState, FormData>(startMfaSetup, initialFormState);

  useEffect(() => {
    if (state.status === "error") document.getElementById("password")?.focus();
  }, [state]);

  if (state.status === "ready") return <ScanStep {...state} />;

  return (
    <div className="space-y-4">
      <p>
        You will need an authenticator app on your phone, such as Google Authenticator, Microsoft Authenticator or
        2FAS. Install one now if you don&apos;t have one.
      </p>
      <form action={action} noValidate className="space-y-6">
        <FormContext value={state}>
          <TextField name="password" label="Confirm your password" type="password" required autoComplete="current-password" />
        </FormContext>
        <button type="submit" disabled={pending} className={buttonClass("primary", "cursor-pointer disabled:opacity-70")}>
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

function ScanStep({ qrSvg, setupKey, backupCodes }: { qrSvg: string; setupKey: string; backupCodes: string[] }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="scan-heading" className="space-y-3">
        <h2 id="scan-heading" className="text-xl font-bold">
          1. Scan this QR code with your authenticator app
        </h2>
        <div
          role="img"
          aria-label="QR code for setting up your authenticator app"
          className="w-56 rounded-xl bg-white p-3 [&_svg]:h-auto [&_svg]:w-full"
          // Rendered on the server from our own TOTP URI, never from user input.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="text-base">
          Can&apos;t scan it? Choose &ldquo;enter a setup key&rdquo; in your app and type:{" "}
          <code className="break-all rounded bg-sand px-2 py-1 font-mono">{setupKey.match(/.{1,4}/g)?.join(" ")}</code>
        </p>
      </section>

      <section aria-labelledby="backup-heading" className="space-y-3">
        <h2 id="backup-heading" className="text-xl font-bold">
          2. Keep your backup codes safe
        </h2>
        <p className="text-base">
          Each code works once, if you lose your phone. Write them down or store them in a password manager — not in
          your email.
        </p>
        <ul className="grid max-w-md grid-cols-2 gap-2 rounded-xl border border-line bg-surface p-4 font-mono">
          {backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <Notice title="You won't see these codes again after you leave this page" />
      </section>

      <section aria-labelledby="confirm-heading" className="space-y-3">
        <h2 id="confirm-heading" className="text-xl font-bold">
          3. Enter the code from your app
        </h2>
        <FormShell action={confirmMfaSetup} submitLabel="Finish setup" pendingLabel="Checking…" botProtection={false}>
          <TextField name="code" label="6-digit code" required inputMode="numeric" autoComplete="one-time-code" className="w-40" />
        </FormShell>
      </section>
    </div>
  );
}

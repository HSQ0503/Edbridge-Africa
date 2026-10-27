"use client";

import { createContext, useActionState, useContext, useEffect, useRef } from "react";
import { HONEYPOT_FIELD, initialFormState, type FormAction, type FormState } from "@/lib/form-state";
import { buttonClass } from "@/components/button-link";
import { Turnstile } from "./turnstile";

// Exported for forms that need their own state shape but the same field components.
export const FormContext = createContext<FormState>(initialFormState);

export function useFieldState(name: string) {
  const state = useContext(FormContext);
  if (state.status !== "error") return { error: undefined, value: undefined };
  return { error: state.fieldErrors[name]?.[0], value: state.values[name] };
}

export function FormShell({
  action,
  submitLabel,
  pendingLabel = "Sending…",
  successTitle,
  successMessage,
  botProtection = true,
  children,
}: {
  action: FormAction;
  submitLabel: string;
  pendingLabel?: string;
  // Staff forms that redirect on success don't need these.
  successTitle?: string;
  successMessage?: string;
  // Honeypot + Turnstile for public forms; staff forms are behind sign-in instead.
  botProtection?: boolean;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status !== "idle") headingRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border-l-4 border-brand bg-brand-tint p-6">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
          {successTitle}
        </h2>
        <p className="mt-2">{successMessage}</p>
        {state.reference && (
          <p className="mt-4">
            Your reference is <strong className="font-mono tracking-wide">{state.reference}</strong>. Please keep it
            in case you need to contact us about this.
          </p>
        )}
      </div>
    );
  }

  const errors = state.status === "error" ? Object.entries(state.fieldErrors) : [];

  return (
    <form action={formAction} noValidate className="relative space-y-8">
      {state.status === "error" && (
        <div className="rounded-xl border-l-4 border-danger bg-surface p-5">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold">
            {state.message}
          </h2>
          {errors.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-base">
              {errors.map(([name, messages]) => (
                <li key={name}>
                  <a href={`#${name}`} className="font-semibold text-danger underline">
                    {messages[0]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <FormContext value={state}>{children}</FormContext>

      {botProtection && (
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
          <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>
      )}

      <div className="space-y-4">
        {botProtection && <Turnstile resetSignal={state} />}
        <button type="submit" disabled={pending} className={buttonClass("primary", "cursor-pointer disabled:opacity-70")}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

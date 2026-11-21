"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/button-link";

// For plain server-action forms outside FormShell, so a click shows something straight away.
export function PendingButton({ label, pendingLabel, variant = "primary" }: { label: string; pendingLabel: string; variant?: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, "cursor-pointer disabled:opacity-70")}>
      {pending ? pendingLabel : label}
    </button>
  );
}

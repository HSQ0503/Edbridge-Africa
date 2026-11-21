"use client";

import { Checkbox } from "@/components/form/fields";
import { useFieldState } from "@/components/form/form-shell";

// Appears only after the server finds a possible duplicate, so the person can confirm it's someone different.
export function DuplicateConfirm() {
  const { error } = useFieldState("confirmDuplicate");
  if (!error) return null;
  return <Checkbox name="confirmDuplicate" label="I've checked: this is a different person, register them anyway" />;
}

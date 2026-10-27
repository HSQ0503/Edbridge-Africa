"use server";

import { refresh } from "next/cache";
import { notFound } from "next/navigation";
import { isInbox, statusLabels, type SubmissionStatus } from "@/server/inboxes";
import { requireStaff } from "@/server/staff";
import { setSubmissionStatus } from "@/server/submissions";

function isStatus(value: string): value is SubmissionStatus {
  return Object.hasOwn(statusLabels, value);
}

// Bound arguments come back from the browser, so they are validated like any other input.
export async function updateStatus(inbox: string, reference: string, formData: FormData) {
  const staff = await requireStaff();
  const status = String(formData.get("status") ?? "");
  if (!isInbox(inbox) || !isStatus(status)) notFound();
  if (!(await setSubmissionStatus(staff, inbox, reference, status))) notFound();
  refresh();
}

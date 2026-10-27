"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/server/audit";
import { auth } from "@/server/auth";
import { getStaff } from "@/server/staff";

export async function signOut() {
  const staff = await getStaff();
  await auth.api.signOut({ headers: await headers() });
  if (staff) await recordAuditEvent({ actorId: staff.id, action: "staff.signed_out" });
  redirect("/portal/sign-in");
}

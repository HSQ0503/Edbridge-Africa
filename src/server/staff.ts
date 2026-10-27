import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./db";
import { isInbox, type Inbox } from "./inboxes";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
// Recording every request would mean a write per page view; once a minute is precise enough.
const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;

export type Staff = { id: string; name: string; email: string; mfaEnabled: boolean; inboxes: Inbox[] };

// The data access layer for the portal: every page and action gets the staff member from here.
export const getStaff = cache(async (): Promise<Staff | null> => {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const { session, user } = result;

  const activity = await prisma.session.findUnique({
    where: { id: session.id },
    select: { createdAt: true, lastActiveAt: true },
  });
  const now = Date.now();
  if (
    !activity ||
    now - activity.createdAt.getTime() > ABSOLUTE_TIMEOUT_MS ||
    now - activity.lastActiveAt.getTime() > IDLE_TIMEOUT_MS
  ) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }
  if (now - activity.lastActiveAt.getTime() > ACTIVITY_WRITE_INTERVAL_MS) {
    await prisma.session.update({ where: { id: session.id }, data: { lastActiveAt: new Date(now) } });
  }

  const access = await prisma.inboxAccess.findMany({ where: { userId: user.id }, select: { inbox: true } });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mfaEnabled: user.twoFactorEnabled === true,
    inboxes: access.map(({ inbox }) => inbox),
  };
});

export async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/portal/sign-in");
  // A password-only session can do one thing: set up two-factor authentication.
  if (!staff.mfaEnabled) redirect("/portal/set-up-mfa");
  return staff;
}

// Inboxes the staff member can't open are reported as not found, so their existence doesn't leak.
export async function requireInbox(value: string) {
  const staff = await requireStaff();
  if (!isInbox(value) || !staff.inboxes.includes(value)) notFound();
  return { staff, inbox: value };
}

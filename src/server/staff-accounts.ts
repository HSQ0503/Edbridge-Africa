import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { site } from "@/content/site";
import type { CmsRole } from "@/generated/prisma/enums";
import { recordAuditEvent } from "./audit";
import { prisma } from "./db";
import type { Inbox } from "./inboxes";
import { sendEmails } from "./notify";
import type { Staff } from "./staff";

export const cmsRoleLabels: Record<CmsRole, { label: string; hint: string }> = {
  writer: { label: "Writer", hint: "Drafts news and pages, and submits them for approval" },
  publisher: { label: "Publisher", hint: "Approves and publishes website content" },
  safeguarding_reviewer: { label: "Safeguarding reviewer", hint: "Must approve anything that features a child" },
};

export type StaffAccess = { name: string; inboxes: Inbox[]; cmsRoles: CmsRole[]; isStaffAdmin: boolean };

export const PASSWORD_LINK_LIFETIME_DAYS = 3;
// Better Auth's resetPassword endpoint consumes verification rows in exactly this shape (better-auth 1.7), so a
// link made here is redeemed, checked for expiry and used up by Better Auth itself.
const PASSWORD_LINK_PREFIX = "reset-password:";

const memberSelect = {
  id: true,
  name: true,
  email: true,
  isStaffAdmin: true,
  twoFactorEnabled: true,
  inboxAccess: { select: { inbox: true } },
  cmsAccess: { select: { role: true } },
} as const;

export function listStaffMembers() {
  return prisma.user.findMany({ orderBy: { name: "asc" }, select: memberSelect });
}

export function getStaffMember(id: string) {
  return prisma.user.findUnique({ where: { id }, select: memberSelect });
}

function auditDetail(access: StaffAccess) {
  return { inboxes: access.inboxes, cmsRoles: access.cmsRoles, isStaffAdmin: access.isStaffAdmin };
}

// Returns false if the address already has an account.
export async function createStaffMember(admin: Staff, email: string, access: StaffAccess) {
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return false;

  const userId = randomUUID();
  // Nobody knows this password: the new person chooses their own through the emailed link.
  const unusablePassword = await hashPassword(randomBytes(32).toString("base64url"));
  await prisma.user.create({
    data: {
      id: userId,
      name: access.name,
      email,
      emailVerified: true,
      isStaffAdmin: access.isStaffAdmin,
      accounts: { create: { id: randomUUID(), accountId: userId, providerId: "credential", password: unusablePassword } },
      inboxAccess: { createMany: { data: access.inboxes.map((inbox) => ({ inbox })) } },
      cmsAccess: { createMany: { data: access.cmsRoles.map((role) => ({ role })) } },
    },
  });
  await recordAuditEvent({ actorId: admin.id, action: "staff.created", targetType: "user", targetId: userId, detail: auditDetail(access) });
  await emailPasswordLink(userId);
  return true;
}

// Access is read from the database on every request, so changes apply without signing the person out.
export async function updateStaffAccess(admin: Staff, userId: string, access: StaffAccess) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name: access.name, isStaffAdmin: access.isStaffAdmin } }),
    prisma.inboxAccess.deleteMany({ where: { userId } }),
    prisma.inboxAccess.createMany({ data: access.inboxes.map((inbox) => ({ userId, inbox })) }),
    prisma.cmsAccess.deleteMany({ where: { userId } }),
    prisma.cmsAccess.createMany({ data: access.cmsRoles.map((role) => ({ userId, role })) }),
  ]);
  await recordAuditEvent({
    actorId: admin.id,
    action: "staff.access_changed",
    targetType: "user",
    targetId: userId,
    detail: auditDetail(access),
  });
}

export async function sendPasswordLink(admin: Staff, userId: string) {
  await emailPasswordLink(userId);
  await recordAuditEvent({ actorId: admin.id, action: "staff.password_link_sent", targetType: "user", targetId: userId });
}

export async function removeStaffMember(admin: Staff, userId: string) {
  const { email } = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
  // Sessions, access and the sign-in account go with the user; unused password links are removed too.
  await prisma.$transaction([
    prisma.verification.deleteMany({ where: { value: userId, identifier: { startsWith: PASSWORD_LINK_PREFIX } } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
  await recordAuditEvent({ actorId: admin.id, action: "staff.removed", targetType: "user", targetId: userId, detail: { email } });
}

// Each new link replaces any earlier one, so only the newest email works.
async function emailPasswordLink(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, email: true, twoFactorEnabled: true } });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + PASSWORD_LINK_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.verification.deleteMany({ where: { value: userId, identifier: { startsWith: PASSWORD_LINK_PREFIX } } }),
    prisma.verification.create({ data: { id: randomUUID(), identifier: `${PASSWORD_LINK_PREFIX}${token}`, value: userId, expiresAt } }),
  ]);

  const url = new URL(`/portal/set-password/${token}`, site.url).toString();
  // Someone who has never confirmed a sign-in code is still being invited.
  const invited = user.twoFactorEnabled !== true;
  const sent = await sendEmails([
    {
      to: user.email,
      subject: invited ? "Your EdBridge staff portal account" : "Set a new password for the EdBridge staff portal",
      text: [
        `Hello ${user.name},`,
        invited
          ? "You've been given an account on the EdBridge Africa staff portal. Choose your password here:"
          : "A staff admin has sent you a link to set a new password for the EdBridge Africa staff portal:",
        url,
        `The link works once and expires in ${PASSWORD_LINK_LIFETIME_DAYS} days. Then sign in at ${new URL("/portal/sign-in", site.url)} — we'll email you a code each time you do.`,
        "If you weren't expecting this, you can ignore it.",
      ].join("\n\n"),
    },
  ]);
  if (!sent && process.env.NODE_ENV !== "production") console.info(`[staff] Password link for ${user.email}: ${url}`);
}

// Checked before showing the form, so an expired link says so straight away.
export async function passwordLinkUser(token: string) {
  const link = await prisma.verification.findFirst({
    where: { identifier: `${PASSWORD_LINK_PREFIX}${token}`, expiresAt: { gt: new Date() } },
    select: { value: true },
  });
  return link?.value ?? null;
}

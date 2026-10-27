// Creates staff accounts and sets which inboxes they can open, until the portal has its own admin screens.
import { randomBytes, randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { hashPassword } from "better-auth/crypto";
import { recordAuditEvent } from "../src/server/audit";
import { prisma } from "../src/server/db";
import { inboxes, isInbox } from "../src/server/inboxes";

const usage = `Usage:
  npm run staff:add -- --email <email> --name "<full name>" --inbox <inbox> [--inbox <inbox> ...]
  npm run staff:add -- --email <email> --inbox <inbox> ...   replace an existing person's inbox access
  npm run staff:add -- --email <email> --reset              new temporary password, two-step verification cleared

Inboxes: ${Object.keys(inboxes).join(", ")}`;

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    inbox: { type: "string", multiple: true, default: [] },
    reset: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(`${message}\n\n${usage}`);
  process.exit(1);
}

function temporaryPassword() {
  return randomBytes(18).toString("base64url");
}

async function main() {
  const email = values.email?.trim().toLowerCase();
  if (!email) fail("--email is required");
  const unknown = values.inbox.filter((inbox) => !isInbox(inbox));
  if (unknown.length) fail(`Unknown inbox: ${unknown.join(", ")}`);
  const grantedInboxes = values.inbox.filter(isInbox);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing && values.reset) {
    const password = temporaryPassword();
    await prisma.$transaction([
      prisma.account.updateMany({
        where: { userId: existing.id, providerId: "credential" },
        data: { password: await hashPassword(password) },
      }),
      prisma.twoFactor.deleteMany({ where: { userId: existing.id } }),
      prisma.user.update({ where: { id: existing.id }, data: { twoFactorEnabled: false } }),
      prisma.session.deleteMany({ where: { userId: existing.id } }),
    ]);
    await recordAuditEvent({ actorId: null, action: "staff.account_reset", targetType: "user", targetId: existing.id });
    console.log(`Reset ${email}. Temporary password (shown once): ${password}`);
    console.log("They must set up two-step verification again when they next sign in.");
    return;
  }

  if (existing) {
    await prisma.$transaction([
      prisma.inboxAccess.deleteMany({ where: { userId: existing.id } }),
      prisma.inboxAccess.createMany({ data: grantedInboxes.map((inbox) => ({ userId: existing.id, inbox })) }),
      // Access changes take effect immediately: existing sessions are signed out.
      prisma.session.deleteMany({ where: { userId: existing.id } }),
    ]);
    await recordAuditEvent({
      actorId: null,
      action: "staff.access_changed",
      targetType: "user",
      targetId: existing.id,
      detail: { inboxes: grantedInboxes },
    });
    console.log(`Updated ${email}. Inboxes: ${grantedInboxes.join(", ") || "none"}`);
    return;
  }

  if (values.reset) fail(`No account found for ${email}`);
  const name = values.name?.trim();
  if (!name) fail("--name is required for a new account");

  const userId = randomUUID();
  const password = temporaryPassword();
  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      accounts: {
        create: { id: randomUUID(), accountId: userId, providerId: "credential", password: await hashPassword(password) },
      },
      inboxAccess: { createMany: { data: grantedInboxes.map((inbox) => ({ inbox })) } },
    },
  });
  await recordAuditEvent({
    actorId: null,
    action: "staff.created",
    targetType: "user",
    targetId: userId,
    detail: { inboxes: grantedInboxes },
  });
  console.log(`Created ${email}. Inboxes: ${grantedInboxes.join(", ") || "none"}`);
  console.log(`Temporary password (shown once): ${password}`);
  console.log("They sign in at /portal/sign-in and set up two-step verification first.");
}

main().finally(() => prisma.$disconnect());

import { site } from "@/content/site";
import { prisma } from "./db";
import type { Inbox } from "./inboxes";

type Email = { to: string; subject: string; text: string };

// Every new submission is also announced to EdBridge's shared mailbox.
const SHARED_MAILBOX = "info@edbridgeafrica.org";
// A shared mailbox may be read by the very person a conflict report is about, so these stay with their own inboxes.
const PRIVATE_INBOXES: Inbox[] = ["about_safeguarding_lead", "about_executive"];

// Returns false when nothing was sent, so callers can fall back (sign-in codes are logged in development).
export async function sendEmails(emails: Email[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || emails.length === 0) return false;

  // One message per recipient so addresses aren't shared with each other.
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(emails.map((email) => ({ from: process.env.ALERT_EMAIL_FROM, ...email }))),
  });
  if (!response.ok) console.error(`[notify] Resend returned ${response.status}`);
  return response.ok;
}

// Alerts never say what arrived or who sent it: details are only visible after signing in (PLAN.md §12).
export async function alertInboxStaff(inbox: Inbox) {
  const staff = await prisma.user.findMany({
    where: { inboxAccess: { some: { inbox } } },
    select: { email: true },
  });
  const recipients = new Set(staff.map(({ email }) => email));
  if (!PRIVATE_INBOXES.includes(inbox)) recipients.add(SHARED_MAILBOX);
  if (recipients.size === 0) return;

  const portalUrl = new URL("/portal", site.url).toString();
  const sent = await sendEmails(
    [...recipients].map((to) => ({
      to,
      subject: "New item in the EdBridge staff portal",
      text: `You have a new item that needs your attention in the EdBridge staff portal.\n\nSign in to view it: ${portalUrl}`,
    })),
  );
  if (!sent && !process.env.RESEND_API_KEY) console.info(`[notify] ${recipients.size} alert(s) not sent (RESEND_API_KEY not set)`);
}

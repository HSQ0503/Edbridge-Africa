import { site } from "@/content/site";
import { prisma } from "./db";
import type { Inbox } from "./inboxes";

// Alerts never say what arrived or who sent it: details are only visible after signing in (PLAN.md §12).
export async function alertInboxStaff(inbox: Inbox) {
  const recipients = await prisma.user.findMany({
    where: { inboxAccess: { some: { inbox } } },
    select: { email: true },
  });
  if (recipients.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[notify] ${recipients.length} staff member(s) would be alerted (RESEND_API_KEY not set)`);
    return;
  }

  const portalUrl = new URL("/portal", site.url).toString();
  // One message per recipient so staff addresses aren't shared with each other.
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(
      recipients.map(({ email }) => ({
        from: process.env.ALERT_EMAIL_FROM,
        to: email,
        subject: "New item in the EdBridge staff portal",
        text: `You have a new item that needs your attention in the EdBridge staff portal.\n\nSign in to view it: ${portalUrl}`,
      })),
    ),
  });
  if (!response.ok) console.error(`[notify] Resend returned ${response.status}`);
}

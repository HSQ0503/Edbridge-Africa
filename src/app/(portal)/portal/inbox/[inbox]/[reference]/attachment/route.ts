import { isInbox } from "@/server/inboxes";
import { getStaff } from "@/server/staff";
import { openAttachment } from "@/server/submissions";

const extensions: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

function notFound() {
  return new Response("Not found", { status: 404 });
}

export async function GET(_request: Request, { params }: RouteContext<"/portal/inbox/[inbox]/[reference]/attachment">) {
  const staff = await getStaff();
  if (!staff?.mfaEnabled) return notFound();
  const { inbox, reference } = await params;
  if (!isInbox(inbox)) return notFound();
  const file = await openAttachment(staff, inbox, reference);
  if (!file) return notFound();

  // The download is named after the reference, never the applicant's own file name.
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${reference}.${extensions[file.mimeType] ?? "bin"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

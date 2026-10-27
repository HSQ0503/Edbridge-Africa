import { statusLabels, type SubmissionStatus } from "@/server/inboxes";

// Staff work in Ghana, so times show in Accra time whatever the server's timezone.
const dateTime = new Intl.DateTimeFormat("en-GH", { timeZone: "Africa/Accra", dateStyle: "medium", timeStyle: "short" });

export function formatDateTime(date: Date) {
  return dateTime.format(date);
}

const statusStyles: Record<SubmissionStatus, string> = {
  new: "bg-accent text-on-accent",
  in_progress: "bg-brand-tint text-ink",
  closed: "border border-line text-muted",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-0.5 text-sm font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

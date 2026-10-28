import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonClass } from "@/components/button-link";
import { Notice } from "@/components/notice";
import { formFields, inboxes, statusLabels, type AnswerField } from "@/server/inboxes";
import { requireInbox } from "@/server/staff";
import { openSubmission } from "@/server/submissions";
import { formatDateTime, StatusBadge } from "../../../format";
import { StaffBar } from "../../../staff-bar";
import { updateStatus } from "./actions";

export const instant = false;

export const metadata: Metadata = { title: "Record" };

function formatAnswer(field: AnswerField, value: unknown): string | null {
  const labelFor = (option: string) => field.options?.find((candidate) => candidate.value === option)?.label ?? option;
  if (Array.isArray(value)) return value.length ? value.map((item) => labelFor(String(item))).join(", ") : null;
  if (value === undefined || value === null || value === "") return null;
  // Checkboxes that must be ticked are stored as the literal "yes".
  if (value === "yes" && !field.options) return "Yes";
  return labelFor(String(value));
}

export default async function SubmissionPage({ params }: PageProps<"/portal/inbox/[inbox]/[reference]">) {
  const { inbox: inboxParam, reference } = await params;
  const { staff, inbox } = await requireInbox(inboxParam);
  const submission = await openSubmission(staff, inbox, reference);
  if (!submission) notFound();
  const { title, fields } = formFields[submission.form];

  return (
    <>
      <StaffBar staff={staff} />
      <p>
        <Link href={`/portal/inbox/${inbox}`} className="inline-flex items-center gap-1 font-semibold text-brand underline">
          <ArrowLeft aria-hidden="true" className="size-4" /> {inboxes[inbox].title}
        </Link>
      </p>

      <div className="mt-4 space-y-2">
        <p className="font-semibold text-muted">{title}</p>
        <h1 className="font-mono text-2xl font-bold sm:text-3xl">{submission.reference}</h1>
        <p className="flex flex-wrap items-center gap-3 text-base">
          Received {formatDateTime(submission.receivedAt)} <StatusBadge status={submission.status} />
        </p>
      </div>

      {submission.safeguarding && (
        <div className="mt-6">
          <Notice tone="urgent" title="Restricted safeguarding record">
            <p>
              Don&apos;t copy these details into email, WhatsApp or other systems. Follow the safeguarding procedure
              {submission.anonymous && ". This report was made anonymously"}.
            </p>
          </Notice>
        </div>
      )}

      <h2 className="mt-8 text-xl font-bold">Answers</h2>
      <dl className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
        {fields.map((field) => {
          const answer = formatAnswer(field, submission.answers[field.name]);
          return (
            <div key={field.name} className="grid gap-1 p-4 sm:grid-cols-[14rem_1fr] sm:gap-6 sm:p-5">
              <dt className="font-semibold">{field.label}</dt>
              <dd className="whitespace-pre-wrap break-words">{answer ?? <span className="text-muted">Not given</span>}</dd>
            </div>
          );
        })}
      </dl>

      <section aria-labelledby="status-heading" className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <h2 id="status-heading" className="text-xl font-bold">
          Status
        </h2>
        <form key={submission.status} action={updateStatus.bind(null, inbox, submission.reference)} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="status" className="block font-semibold">
              Change status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={submission.status}
              className="mt-2 block min-h-12 rounded-lg border-2 border-field bg-surface px-3 py-2.5 text-ink"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={buttonClass("primary", "cursor-pointer")}>
            Update status
          </button>
        </form>
      </section>
    </>
  );
}

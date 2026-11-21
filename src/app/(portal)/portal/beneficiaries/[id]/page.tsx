import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClass } from "@/components/button-link";
import { CheckboxGroup, RadioGroup, SelectField, TextArea, TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { Notice } from "@/components/notice";
import { priorityBand, recommendations } from "@/lib/assessment-form";
import {
  ageOn,
  assentOptions,
  assistanceCategories,
  assistanceStatusLabels,
  assistanceStatusOptions,
  beneficiaryCategories,
  consentMethods,
  decisionResultLabels,
  decisionOptions,
  employmentStatuses,
  familyCircumstances,
  formatGhs,
  genderLabels,
  incomeRanges,
  labelOf,
  noteKindLabels,
  noteKindOptions,
  referralSources,
  statusLabels,
} from "@/lib/beneficiaries";
import { can, requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { listProgrammes, openBeneficiary } from "@/server/beneficiaries/records";
import { formatDateTime } from "../../format";
import { StaffBar } from "../../staff-bar";
import { BackLink, BeneficiaryStatusBadge, Details, formatDay, SectionHeading } from "../ui";
import {
  assistanceAction,
  assistanceStatusAction,
  beginAssessment,
  decideAction,
  noteAction,
  programmesAction,
  statusAction,
} from "./actions";
import { PendingButton } from "../pending-button";
import { StatusFields } from "./status-fields";

export const instant = false;

// Static on purpose: a title with the beneficiary's name would end up in browser history and tab lists.
export const metadata: Metadata = { title: "Beneficiary" };

const list = (options: { value: string; label: string }[], values: string[], other?: string | null) =>
  values.length ? values.map((value) => (value === "other" && other ? `Other: ${other}` : labelOf(options, value))).join(", ") : null;

const panel = "rounded-2xl border border-line bg-surface p-5 sm:p-6";

export default async function BeneficiaryPage({ params }: PageProps<"/portal/beneficiaries/[id]">) {
  const { id } = await params;
  const staff = await requireBeneficiaryPermission("view");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const record = await openBeneficiary(staff, id);
  if (!record) notFound();
  const programmes = can(staff, "decide") ? await listProgrammes({ activeOnly: false }) : [];

  const { nameOf, household } = record;
  const today = new Date();
  const latestSubmitted = record.assessments.find((assessment) => assessment.status === "submitted");
  const latestDecision = record.decisions[0];
  const myDraft = record.assessments.find((assessment) => assessment.status === "draft" && assessment.assessedBy === staff.id);
  // The neutral flag from PLAN.md §8.5: only the people who may need to act on it see it.
  const showSafeguardingFlag =
    latestSubmitted?.safeguardingFlag &&
    (can(staff, "viewSensitive") || record.caseOfficerId === staff.id || latestSubmitted.assessedBy === staff.id);
  const enrolledIds = record.enrolments.map((enrolment) => enrolment.programmeId);
  const programmeOptions = programmes
    .filter((programme) => programme.active || enrolledIds.includes(programme.id))
    .map((programme) => ({ value: programme.id, label: programme.active ? programme.name : `${programme.name} (no longer running)` }));
  const assistanceStatusChoices = can(staff, "approveAssistance")
    ? assistanceStatusOptions
    : assistanceStatusOptions.filter((option) => option.value !== "approved" && option.value !== "delivered");
  const timeline = [
    ...record.statusChanges.map((change) => ({
      at: change.changedAt,
      key: `s-${change.id}`,
      title: change.fromStatus ? `${statusLabels[change.fromStatus]} → ${statusLabels[change.toStatus]}` : "Registered",
      by: nameOf(change.changedBy),
      details: [
        change.details.reason,
        change.details.outcomes && `Outcomes: ${change.details.outcomes}`,
        change.details.outstandingNeeds && `Outstanding needs: ${change.details.outstandingNeeds}`,
        change.details.followUp && `Follow-up: ${change.details.followUp}`,
        change.details.alumniConsent && `Alumni contact: ${{ yes: "consented", no: "declined", not_asked: "not asked yet" }[change.details.alumniConsent] ?? change.details.alumniConsent}`,
      ].filter(Boolean) as string[],
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <>
      <StaffBar staff={staff} />
      <BackLink href="/portal/beneficiaries">Beneficiaries</BackLink>

      <header className="mt-4 space-y-3">
        <p className="font-mono font-semibold text-muted">{record.code}</p>
        <h1 className="text-3xl font-bold sm:text-4xl">{record.fullName}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base">
          <BeneficiaryStatusBadge status={record.status} />
          <span>
            Age {ageOn(record.dateOfBirth, today)}
            {record.dobEstimated && " (estimated)"} · {genderLabels[record.gender] ?? record.gender} ·{" "}
            {[record.community, record.district, record.region].filter(Boolean).join(", ")}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
          {can(staff, "assess") && (
            <form action={beginAssessment.bind(null, record.id)}>
              <PendingButton
                label={myDraft ? "Continue your assessment" : record.assessments.length ? "Start a review assessment" : "Start the assessment"}
                pendingLabel="Opening…"
              />
            </form>
          )}
          {can(staff, "register") && (
            <Link href={`/portal/beneficiaries/${record.id}/edit`} prefetch={false} className={buttonClass("secondary")}>
              Edit details
            </Link>
          )}
        </div>
      </header>

      <div className="mt-8 space-y-4">
        {showSafeguardingFlag && (
          <Notice tone="urgent" title="Speak to the Safeguarding Officer before contacting this family">
            <p>The latest assessment recorded a protection concern. Follow the safeguarding procedure.</p>
          </Notice>
        )}
        {record.accessibilityNeeds && (
          <Notice title="Accessibility support needed">
            <p>Plan communication, venues and materials with this in mind. Details are in the assessment for staff who need them.</p>
          </Notice>
        )}
      </div>

      <div className="mt-10 space-y-12">
        <section aria-labelledby="summary-heading" className="space-y-4">
          <SectionHeading id="summary-heading">Summary</SectionHeading>
          <Details
            items={[
              [
                "Priority score",
                latestSubmitted?.totalScore != null
                  ? `${latestSubmitted.totalScore} of 100 · ${priorityBand(latestSubmitted.totalScore).label}`
                  : "No completed assessment yet",
              ],
              [
                "Selection",
                latestDecision
                  ? `${decisionResultLabels[latestDecision.outcome]} by ${nameOf(latestDecision.decidedBy)}, ${formatDateTime(latestDecision.decidedAt)}`
                  : "No decision yet",
              ],
              ["Programmes", record.enrolments.map((enrolment) => enrolment.programme.name).join(", ")],
              ["Case officer", nameOf(record.caseOfficerId)],
              ["Registered", `${formatDay(record.createdAt)} by ${nameOf(record.createdBy)}`],
            ]}
          />
        </section>

        <section aria-labelledby="identification-heading" className="space-y-4">
          <SectionHeading id="identification-heading">Identification</SectionHeading>
          <Details
            items={[
              ["Beneficiary ID", <span key="code" className="font-mono">{record.code}</span>],
              ["Date of birth", `${formatDay(record.dateOfBirth)}${record.dobEstimated ? " (estimated)" : ""}`],
              ["Nationality", record.nationality],
              ["Residential location", record.residentialLocation],
              ["Contact number", record.contactNumber],
              ["Category", list(beneficiaryCategories, record.categories, record.categoryOther)],
              ["Referred by", labelOf(referralSources, record.referralSource)],
              [
                "Consent",
                `${labelOf(consentMethods, record.consentMethod)}, ${formatDay(record.consentDate)}${
                  record.childAssent ? `. Child's assent: ${labelOf(assentOptions, record.childAssent)?.toLowerCase()}` : ""
                }`,
              ],
            ]}
          />
        </section>

        <section aria-labelledby="household-heading" className="space-y-4">
          <SectionHeading id="household-heading">Parent/guardian and household</SectionHeading>
          {household ? (
            <>
              <Details
                items={[
                  ["Household number", <span key="hh" className="font-mono">{household.code}</span>],
                  ["Parent/guardian", [household.guardianName, record.guardianRelationship && `(${record.guardianRelationship})`].filter(Boolean).join(" ")],
                  ["Contact numbers", [household.guardianPhone, household.guardianAltPhone].filter(Boolean).join(", ")],
                  ["Occupation", [household.guardianOccupation, labelOf(employmentStatuses, household.guardianEmployment)].filter(Boolean).join(" · ")],
                  ["Guardian's address", household.guardianAddress],
                  ["Emergency contact", household.emergencyContact],
                  ["Primary caregiver", household.primaryCaregiver],
                  [
                    "Household",
                    [
                      household.membersCount != null && `${household.membersCount} members`,
                      household.dependantsCount != null && `${household.dependantsCount} dependants`,
                      household.childrenCount != null && `${household.childrenCount} children`,
                      household.childrenInSchool != null && `${household.childrenInSchool} in school`,
                      household.childrenOutOfSchool != null && `${household.childrenOutOfSchool} out of school`,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  ],
                  ["Income", [household.incomeSource, labelOf(incomeRanges, household.incomeRange)].filter(Boolean).join(" · ")],
                  ["Housing", household.housing],
                  ["Family circumstances", list(familyCircumstances, household.circumstances, household.circumstancesOther)],
                ]}
              />
              {household.beneficiaries.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold">Also registered from this household</h3>
                  <ul className="mt-2 space-y-1">
                    {household.beneficiaries.map((sibling) => (
                      <li key={sibling.id}>
                        <Link href={`/portal/beneficiaries/${sibling.id}`} prefetch={false} className="font-semibold text-brand underline">
                          {sibling.fullName}
                        </Link>{" "}
                        <span className="font-mono text-base text-muted">{sibling.code}</span>{" "}
                        <span className="text-base text-muted">· {statusLabels[sibling.status]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted">No guardian or household recorded.</p>
          )}
        </section>

        <section aria-labelledby="assessments-heading" className="space-y-4">
          <SectionHeading id="assessments-heading">Assessments</SectionHeading>
          {record.assessments.length === 0 ? (
            <p className="text-muted">Not assessed yet.</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {record.assessments.map((assessment) => (
                <li key={assessment.id}>
                  <Link
                    href={`/portal/beneficiaries/${record.id}/assessments/${assessment.id}`}
                    prefetch={false}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 text-ink no-underline transition-colors duration-200 hover:bg-brand-tint sm:p-5"
                  >
                    <span className="font-semibold underline">
                      {assessment.status === "draft" ? "Draft started" : "Submitted"}{" "}
                      {formatDay(assessment.submittedAt ?? assessment.createdAt)}
                    </span>
                    <span className="text-base text-muted">by {nameOf(assessment.assessedBy)}</span>
                    <span className="text-base sm:ml-auto">
                      {assessment.totalScore != null && `Score ${assessment.totalScore} · `}
                      {labelOf(recommendations, assessment.recommendation) ?? (assessment.status === "draft" ? "In progress" : "")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="decision-heading" className="space-y-4">
          <SectionHeading id="decision-heading">Selection and approval</SectionHeading>
          {record.decisions.length > 0 ? (
            <ul className="space-y-3">
              {record.decisions.map((decision) => (
                <li key={decision.id} className={panel}>
                  <p className="font-semibold">{decisionResultLabels[decision.outcome]}</p>
                  <p className="text-base text-muted">
                    {nameOf(decision.decidedBy)}, {formatDateTime(decision.decidedAt)}
                    {decision.scoreAtDecision != null && ` · score ${decision.scoreAtDecision} at the time`}
                  </p>
                  {decision.isOverride && (
                    <p className="mt-2 text-base font-semibold text-accent-text">Departs from the score&apos;s priority band (documented override)</p>
                  )}
                  <p className="mt-2 whitespace-pre-wrap">{decision.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No decision yet.</p>
          )}
          {can(staff, "decide") &&
            (latestSubmitted ? (
              latestSubmitted.assessedBy === staff.id ? (
                <p>You completed the latest assessment, so another approver must make the decision.</p>
              ) : (
                <details className={panel} open={record.decisions.length === 0}>
                  <summary className="cursor-pointer text-xl font-bold">{record.decisions.length ? "Record a new decision" : "Record a decision"}</summary>
                  <p className="mt-3 text-base text-muted">
                    Based on the assessment submitted {formatDay(latestSubmitted.submittedAt ?? latestSubmitted.createdAt)}
                    {latestSubmitted.totalScore != null &&
                      `, score ${latestSubmitted.totalScore} (${priorityBand(latestSubmitted.totalScore).label.toLowerCase()})`}
                    . Consider resources and any conflict of interest. An urgent protection concern needs action whatever the score.
                  </p>
                  <div className="mt-5">
                    <FormShell
                      key={record.decisions.length}
                      action={decideAction.bind(null, record.id)}
                      submitLabel="Record decision"
                      pendingLabel="Saving…"
                      botProtection={false}
                    >
                      <RadioGroup name="outcome" legend="Decision" required options={decisionOptions} />
                      <TextArea name="reason" label="Reason for the decision" required rows={4} />
                    </FormShell>
                  </div>
                </details>
              )
            ) : (
              <p>A decision can be recorded once an assessment has been submitted.</p>
            ))}
        </section>

        <section aria-labelledby="programmes-heading" className="space-y-4">
          <SectionHeading id="programmes-heading">Programmes</SectionHeading>
          {record.enrolments.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {record.enrolments.map((enrolment) => (
                <li key={enrolment.programmeId}>
                  {enrolment.programme.name}{" "}
                  <span className="text-base text-muted">
                    since {formatDay(enrolment.enrolledAt)}, added by {nameOf(enrolment.enrolledBy)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Not in any programme yet.</p>
          )}
          {can(staff, "decide") && programmeOptions.length > 0 && (
            <details className={panel}>
              <summary className="cursor-pointer font-semibold text-brand underline">Change programmes</summary>
              <div className="mt-5">
                <FormShell
                  key={enrolledIds.join()}
                  action={programmesAction.bind(null, record.id)}
                  submitLabel="Save programmes"
                  pendingLabel="Saving…"
                  botProtection={false}
                  defaultValues={{ programmes: enrolledIds }}
                >
                  <CheckboxGroup name="programmes" legend="Programmes" hint="A beneficiary can take part in several" options={programmeOptions} />
                </FormShell>
              </div>
            </details>
          )}
        </section>

        <section aria-labelledby="assistance-heading" className="space-y-4">
          <SectionHeading id="assistance-heading">Financial and material assistance</SectionHeading>
          {record.assistance.length === 0 ? (
            <p className="text-muted">No assistance recorded.</p>
          ) : (
            <ul className="space-y-3">
              {record.assistance.map((item) => (
                <li key={item.id} className={panel}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">
                      {labelOf(assistanceCategories, item.category)}
                      {item.valuePesewas != null && ` · ${formatGhs(item.valuePesewas)}`}
                    </p>
                    <p className="text-base font-semibold">{assistanceStatusLabels[item.status]}</p>
                  </div>
                  {item.description && <p className="mt-1">{item.description}</p>}
                  <p className="mt-1 text-base text-muted">
                    {[
                      item.fundingSource && `Funded by ${item.fundingSource}`,
                      item.approvedOn && `approved ${formatDay(item.approvedOn)}`,
                      item.authorizedBy && `authorised by ${nameOf(item.authorizedBy)}`,
                      item.providedOn && `provided ${formatDay(item.providedOn)}`,
                      `recorded by ${nameOf(item.createdBy)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {can(staff, "recordAssistance") && item.status !== "delivered" && item.status !== "cancelled" && (
                    <form action={assistanceStatusAction.bind(null, record.id, item.id)} className="mt-3 flex flex-wrap items-end gap-3">
                      <div>
                        <label htmlFor={`assistance-${item.id}`} className="block text-base font-medium">
                          Update status
                        </label>
                        <select
                          id={`assistance-${item.id}`}
                          name="status"
                          defaultValue={item.status}
                          className="mt-1 block min-h-11 cursor-pointer rounded-lg border border-field bg-surface px-3 py-2 text-base text-ink"
                        >
                          {assistanceStatusChoices.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <PendingButton label="Update" pendingLabel="Updating…" variant="secondary" />
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          {can(staff, "recordAssistance") && (
            <details className={panel}>
              <summary className="cursor-pointer font-semibold text-brand underline">Record assistance</summary>
              <div className="mt-5">
                <FormShell
                  key={record.assistance.length}
                  action={assistanceAction.bind(null, record.id)}
                  submitLabel="Save assistance record" pendingLabel="Saving…" botProtection={false}>
                  <SelectField name="category" label="Type of assistance" required options={assistanceCategories} />
                  <TextField name="description" label="Description" hint="For example: 2 uniforms and 1 pair of school shoes" />
                  <TextField name="value" label="Estimated value (GHS)" inputMode="decimal" />
                  <TextField name="fundingSource" label="Funding source or donor" />
                  <SelectField name="status" label="Status" required options={assistanceStatusChoices} defaultValue="requested" />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextField name="approvedOn" label="Date approved" type="date" />
                    <TextField name="providedOn" label="Date provided" type="date" />
                  </div>
                </FormShell>
              </div>
            </details>
          )}
        </section>

        <section aria-labelledby="notes-heading" className="space-y-4">
          <SectionHeading id="notes-heading">Case notes and support records</SectionHeading>
          {can(staff, "note") && (
            <details className={panel}>
              <summary className="cursor-pointer font-semibold text-brand underline">Add a note</summary>
              <div className="mt-5">
                <FormShell
                  key={record.notes.length}
                  action={noteAction.bind(null, record.id)}
                  submitLabel="Save note"
                  pendingLabel="Saving…"
                  botProtection={false}
                  defaultValues={{ occurredOn: today.toISOString().slice(0, 10), kind: "note" }}
                >
                  <SelectField name="kind" label="Type of record" required options={noteKindOptions} />
                  <TextField name="occurredOn" label="Date" type="date" required />
                  <TextArea
                    name="body"
                    label="Note"
                    hint="Record facts respectfully, and say what you saw yourself and what others told you. Safeguarding concerns go to the Safeguarding Officer, not here."
                    required
                    rows={5}
                  />
                  <TextField name="nextReviewOn" label="Next review date" hint="It will show under “Needs your attention” when it's due" type="date" />
                </FormShell>
              </div>
            </details>
          )}
          {record.notes.length === 0 ? (
            <p className="text-muted">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {record.notes.map((note) => (
                <li key={note.id} className={panel}>
                  <p className="font-semibold">
                    {noteKindLabels[note.kind]} · {formatDay(note.occurredOn)}
                  </p>
                  <p className="text-base text-muted">
                    {nameOf(note.createdBy)}
                    {note.nextReviewOn && ` · next review ${formatDay(note.nextReviewOn)}`}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{note.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="history-heading" className="space-y-4">
          <SectionHeading id="history-heading">Status and history</SectionHeading>
          {can(staff, "decide") && (
            <details className={panel}>
              <summary className="cursor-pointer font-semibold text-brand underline">Change status</summary>
              <div className="mt-5">
                <FormShell key={record.status} action={statusAction.bind(null, record.id)} submitLabel="Change status" pendingLabel="Saving…" botProtection={false}>
                  <StatusFields current={record.status} />
                </FormShell>
              </div>
            </details>
          )}
          <ol className="space-y-3 border-l-2 border-line pl-5">
            {timeline.map((entry) => (
              <li key={entry.key}>
                <p className="font-semibold">{entry.title}</p>
                <p className="text-base text-muted">
                  {formatDateTime(entry.at)} · {entry.by}
                </p>
                {entry.details.map((detail) => (
                  <p key={detail} className="mt-1 whitespace-pre-wrap text-base">
                    {detail}
                  </p>
                ))}
              </li>
            ))}
          </ol>
          <p className="text-base text-muted">Every view and change of this record is also kept in the audit log.</p>
        </section>
      </div>
    </>
  );
}

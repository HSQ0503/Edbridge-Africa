import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Notice } from "@/components/notice";
import { hasSafeguardingConcern } from "@/lib/assessment-form";
import { ageOn, genderLabels } from "@/lib/beneficiaries";
import { requireBeneficiaryPermission } from "@/server/beneficiaries/access";
import { openAssessment } from "@/server/beneficiaries/assessments";
import { formatDateTime } from "../../../../format";
import { StaffBar } from "../../../../staff-bar";
import { BackLink, DataGateNotice, Details, formatDay } from "../../../ui";
import { saveAssessmentAction } from "./actions";
import { AssessmentForm } from "./assessment-form";
import { AssessmentView } from "./assessment-view";

export const instant = false;

export const metadata: Metadata = { title: "Assessment" };

const uuid = /^[0-9a-f-]{36}$/i;

export default async function AssessmentPage({ params }: PageProps<"/portal/beneficiaries/[id]/assessments/[assessmentId]">) {
  const { id, assessmentId } = await params;
  const staff = await requireBeneficiaryPermission("view");
  if (!uuid.test(id) || !uuid.test(assessmentId)) notFound();
  const assessment = await openAssessment(staff, id, assessmentId);
  if (!assessment) notFound();
  const { beneficiary } = assessment;

  const identification = (
    <section aria-labelledby="identification-heading" className="space-y-3">
      <h2 id="identification-heading" className="text-2xl">
        1. Beneficiary identification
      </h2>
      <p className="text-base text-muted">From the registration record.</p>
      <Details
        items={[
          ["Beneficiary ID", <span key="code" className="font-mono">{beneficiary.code}</span>],
          ["Full name", beneficiary.fullName],
          ["Date of birth and age", `${formatDay(beneficiary.dateOfBirth)} · age ${ageOn(beneficiary.dateOfBirth)}${beneficiary.dobEstimated ? " (estimated)" : ""}`],
          ["Gender", genderLabels[beneficiary.gender] ?? beneficiary.gender],
          ["Location", [beneficiary.community, beneficiary.district, beneficiary.region].filter(Boolean).join(", ")],
          ["Parent/guardian", beneficiary.household ? `${beneficiary.household.guardianName} (${beneficiary.household.code})` : null],
          ["Assessment officer", assessment.assessorName],
          ["Case officer", assessment.caseOfficerName],
        ]}
      />
    </section>
  );

  return (
    <>
      <StaffBar staff={staff} />
      <BackLink href={`/portal/beneficiaries/${id}`}>Back to {beneficiary.code}</BackLink>
      <header className="mt-4 space-y-2">
        <p className="font-semibold text-muted">Comprehensive beneficiary assessment</p>
        <h1 className="text-3xl font-bold">
          {assessment.status === "draft" ? "Draft assessment" : "Submitted assessment"}
        </h1>
        <p className="text-base text-muted">
          {assessment.status === "draft"
            ? `Started ${formatDateTime(assessment.createdAt)}, last saved ${formatDateTime(assessment.updatedAt)}`
            : `Submitted ${formatDateTime(assessment.submittedAt ?? assessment.updatedAt)} by ${assessment.assessorName}`}
        </p>
      </header>

      <div className="mt-6 space-y-4">
        <Notice tone="draft" title="Confidential: internal use only">
          <p>Share these details only with authorised staff. Don&apos;t copy them into email, WhatsApp or other systems.</p>
        </Notice>
        {assessment.showSensitive && hasSafeguardingConcern(assessment.answers) && (
          <Notice tone="urgent" title="A protection concern is recorded">
            <p>Urgent concerns must go to the Safeguarding Officer immediately, whatever the score.</p>
          </Notice>
        )}
      </div>

      <div className="mt-8 max-w-4xl space-y-8">
        {assessment.editable ? (
          <>
            <DataGateNotice />
            <div className="space-y-2">
              <p>
                Explain the purpose of the assessment in words the beneficiary and caregiver understand, and don&apos;t
                promise assistance before approval. Leave anything unknown or not applicable empty. Save as you go: you
                can come back and finish later.
              </p>
              <p>Submitting locks the assessment and sends it for a decision. An approver other than you makes it.</p>
            </div>
            <AssessmentForm action={saveAssessmentAction.bind(null, id, assessmentId)} initialAnswers={assessment.answers}>
              {identification}
            </AssessmentForm>
          </>
        ) : (
          <>
            {identification}
            {assessment.status === "draft" && (
              <Notice title="This assessment is still a draft">
                <p>Only {assessment.assessorName} can continue it.</p>
              </Notice>
            )}
            <AssessmentView answers={assessment.answers} showSensitive={assessment.showSensitive} />
          </>
        )}
      </div>
    </>
  );
}

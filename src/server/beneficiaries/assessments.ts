import {
  hasAccessibilityNeeds,
  hasSafeguardingConcern,
  scoreTotal,
  sensitiveSectionIds,
  assessmentSections,
  type Answers,
} from "@/lib/assessment-form";
import { appendAuditEvent, recordAuditEvent } from "../audit";
import { prisma } from "../db";
import type { Staff } from "../staff";
import { can } from "./access";
import { openText, recordStatusChange, sealText, staffNames } from "./records";

// Answers are sealed to the assessment's own id, so they can't be swapped between assessments.
const answersKind = (assessmentId: string) => `assessment:${assessmentId}`;

// Starts a draft, or returns the staff member's existing draft so they never end up with two.
export async function startAssessment(staff: Staff, beneficiaryId: string) {
  if (!can(staff, "assess")) return null;
  const beneficiary = await prisma.beneficiary.findUnique({ where: { id: beneficiaryId }, select: { status: true } });
  if (!beneficiary) return null;
  const existing = await prisma.assessment.findFirst({
    where: { beneficiaryId, assessedBy: staff.id, status: "draft" },
    select: { id: true },
  });
  if (existing) return existing.id;

  return prisma.$transaction(async (tx) => {
    const created = await tx.assessment.create({ data: { beneficiaryId, assessedBy: staff.id, answers: "" }, select: { id: true } });
    const today = new Date().toISOString().slice(0, 10);
    await tx.assessment.update({
      where: { id: created.id },
      data: { answers: sealText(beneficiaryId, answersKind(created.id), { assessmentDate: today }) },
    });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: "beneficiary.assessment_started",
      targetType: "beneficiary",
      targetId: beneficiaryId,
      detail: { assessment: created.id },
    });
    if (beneficiary.status === "newly_registered") {
      await tx.beneficiary.update({ where: { id: beneficiaryId }, data: { status: "under_assessment", updatedBy: staff.id } });
      await recordStatusChange(tx, staff, beneficiaryId, "newly_registered", "under_assessment", { reason: "Assessment started" });
    }
    return created.id;
  });
}

// Hides the restricted sections from anyone without the sensitive-details role, except the assessor who wrote them.
function canSeeSensitive(staff: Staff, assessedBy: string) {
  return can(staff, "viewSensitive") || assessedBy === staff.id;
}

function withoutSensitive(answers: Answers) {
  const hidden = new Set(
    assessmentSections.filter((section) => sensitiveSectionIds.has(section.id)).flatMap((section) => section.fields.map((field) => field.name)),
  );
  return Object.fromEntries(Object.entries(answers).filter(([name]) => !hidden.has(name.split(".")[0]) && !hidden.has(name)));
}

export async function openAssessment(staff: Staff, beneficiaryId: string, assessmentId: string) {
  if (!can(staff, "view")) return null;
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, beneficiaryId },
    include: {
      beneficiary: {
        include: { household: true },
      },
    },
  });
  if (!assessment) return null;

  const allAnswers = assessment.answers ? openText<Answers>(beneficiaryId, answersKind(assessment.id), assessment.answers) : {};
  const showSensitive = canSeeSensitive(staff, assessment.assessedBy);
  const nameOf = await staffNames([assessment.assessedBy, assessment.beneficiary.caseOfficerId]);
  await recordAuditEvent({
    actorId: staff.id,
    action: "beneficiary.assessment_viewed",
    targetType: "beneficiary",
    targetId: beneficiaryId,
    detail: { assessment: assessment.id, sensitive: showSensitive },
  });
  return {
    ...assessment,
    answers: showSensitive ? allAnswers : withoutSensitive(allAnswers),
    showSensitive,
    editable: assessment.status === "draft" && assessment.assessedBy === staff.id && can(staff, "assess"),
    assessorName: nameOf(assessment.assessedBy),
    caseOfficerName: nameOf(assessment.beneficiary.caseOfficerId),
  };
}

export type SaveResult = { ok: true; submitted: boolean } | { ok: false };

export async function saveAssessment(staff: Staff, beneficiaryId: string, assessmentId: string, answers: Answers, submit: boolean): Promise<SaveResult> {
  if (!can(staff, "assess")) return { ok: false };
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, beneficiaryId, assessedBy: staff.id, status: "draft" },
    select: { id: true, beneficiary: { select: { status: true } } },
  });
  if (!assessment) return { ok: false };

  const totalScore = scoreTotal(answers);
  const recommendation = typeof answers.recommendation === "string" ? answers.recommendation : null;
  const educationStatus = typeof answers.educationStatus === "string" ? answers.educationStatus : null;
  const safeguardingFlag = hasSafeguardingConcern(answers);

  await prisma.$transaction(async (tx) => {
    await tx.assessment.update({
      where: { id: assessmentId },
      data: {
        answers: sealText(beneficiaryId, answersKind(assessmentId), answers),
        totalScore,
        recommendation,
        safeguardingFlag,
        ...(submit && { status: "submitted", submittedAt: new Date() }),
      },
    });
    await appendAuditEvent(tx, {
      actorId: staff.id,
      action: submit ? "beneficiary.assessment_submitted" : "beneficiary.assessment_saved",
      targetType: "beneficiary",
      targetId: beneficiaryId,
      detail: { assessment: assessmentId },
    });
    if (!submit) return;

    // The record keeps a plain copy of the few answers that lists and reports filter on.
    const current = assessment.beneficiary.status;
    const moveOn = current === "newly_registered" || current === "under_assessment";
    await tx.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        educationStatus,
        priorityScore: totalScore,
        accessibilityNeeds: hasAccessibilityNeeds(answers),
        updatedBy: staff.id,
        ...(moveOn && { status: "awaiting_verification" }),
      },
    });
    if (moveOn) {
      await recordStatusChange(tx, staff, beneficiaryId, current, "awaiting_verification", { reason: "Assessment submitted" });
    }
  });
  return { ok: true, submitted: submit };
}

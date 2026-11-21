import type { BeneficiaryRole } from "@/generated/prisma/enums";

// The one place that decides what each beneficiary role can do (BMS spec module 18, PLAN.md §4). Every page, action
// and route checks through here. Staff admins get nothing from being admins: IT manages accounts, not records.
export type BeneficiaryPermission =
  | "view" // list, search and open records
  | "register" // add and edit identification, guardian and household details
  | "assess" // start and complete assessments
  | "note" // case notes and support records
  | "decide" // selection decisions, status changes, programme enrolment
  | "manageProgrammes"
  | "recordAssistance"
  | "approveAssistance"
  | "viewSensitive" // disability, health and safeguarding answers
  | "viewReports"; // aggregate reports without names

const grants: Record<BeneficiaryRole, BeneficiaryPermission[]> = {
  registrar: ["view", "register", "viewReports"],
  assessor: ["view", "assess", "note", "recordAssistance", "viewReports"],
  approver: ["view", "decide", "note", "manageProgrammes", "recordAssistance", "approveAssistance", "viewReports"],
  // Adds to a records role; on its own it opens nothing.
  sensitive: ["viewSensitive"],
  reports: ["viewReports"],
};

export function can(staff: { beneficiaryRoles: BeneficiaryRole[] }, permission: BeneficiaryPermission) {
  return staff.beneficiaryRoles.some((role) => grants[role].includes(permission));
}


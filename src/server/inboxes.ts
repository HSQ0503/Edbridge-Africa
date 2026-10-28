import { applicantTypes, schoolStatuses, supportTypes } from "@/app/(site)/apply/options";
import { contactTopics, type ContactTopic } from "@/app/(site)/contact/options";
import { reportSubjects, reportTypes } from "@/app/(site)/report/options";
import { volunteerAvailability, volunteerInterests } from "@/app/(site)/volunteer/options";
import { Inbox, SubmissionStatus } from "@/generated/prisma/enums";
import type { IntakeKind } from "./intake";

export { Inbox, SubmissionStatus };

export const inboxes: Record<Inbox, { title: string; description: string }> = {
  safeguarding: { title: "Safeguarding concerns", description: "Concerns about a child's safety or wellbeing" },
  // Give these only to the people named in the description, never to the person the reports are about.
  about_safeguarding_lead: {
    title: "Reports about the Safeguarding Lead",
    description: "For the Executive Director and the Board Chair only",
  },
  about_executive: {
    title: "Reports about the Executive Director",
    description: "Reports about the Executive Director or Deputy, for the Board Chair only",
  },
  support: { title: "Applications for support", description: "Families, young people and schools asking for help" },
  volunteer: { title: "Volunteers", description: "Volunteer applications and volunteering questions" },
  enquiries: { title: "General enquiries", description: "Contact form messages, including media" },
  partnerships: { title: "Partnership enquiries", description: "Companies and institutions that want to partner" },
  fundraising: { title: "Grants and donations", description: "Funding, grant and sponsorship enquiries" },
  complaints: { title: "Complaints and feedback", description: "Complaints about our services, and suggestions" },
  misconduct: { title: "Fraud and misconduct", description: "Confidential reports of fraud, corruption or staff misconduct" },
};

export const statusLabels: Record<SubmissionStatus, string> = {
  new: "New",
  in_progress: "In progress",
  closed: "Closed",
};

export function isInbox(value: string): value is Inbox {
  return Object.hasOwn(inboxes, value);
}

type ReportType = (typeof reportTypes)[number]["value"];

const contactInboxes: Record<ContactTopic, Inbox> = {
  general: "enquiries",
  partnership: "partnerships",
  grants: "fundraising",
  media: "enquiries",
  volunteering: "volunteer",
  donations: "fundraising",
  other: "enquiries",
};

const reportInboxes: Record<ReportType, Inbox> = {
  safeguarding: "safeguarding",
  complaint: "complaints",
  misconduct: "misconduct",
  feedback: "complaints",
};

// `data` has already passed the form's Zod schema, so the topic and report type are known values.
export function inboxFor(form: IntakeKind, data: Record<string, unknown>): Inbox {
  switch (form) {
    case "volunteer":
      return "volunteer";
    case "support-application":
      return "support";
    case "contact":
      return contactInboxes[data.topic as ContactTopic];
    case "report":
      if (data.aboutLeader === "executive") return "about_executive";
      if (data.aboutLeader === "safeguarding-lead") return "about_safeguarding_lead";
      return reportInboxes[data.reportType as ReportType];
  }
}

export type AnswerField = { name: string; label: string; options?: readonly { value: string; label: string }[] };

// Staff-facing labels for each stored answer, in the order the form asks for them.
export const formFields: Record<IntakeKind, { title: string; fields: AnswerField[] }> = {
  volunteer: {
    title: "Volunteer application",
    fields: [
      { name: "fullName", label: "Full name" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "location", label: "Lives in" },
      { name: "ageConfirmed", label: "Confirmed they are 18 or older" },
      { name: "interests", label: "Would like to help with", options: volunteerInterests },
      { name: "availability", label: "Availability", options: volunteerAvailability },
      { name: "experience", label: "Skills and experience" },
      { name: "accessNeeds", label: "Access needs" },
      { name: "heardAbout", label: "Heard about us from" },
      { name: "safeguardingAcknowledged", label: "Understands safeguarding checks" },
      { name: "privacyConsent", label: "Agreed to how we use their details" },
    ],
  },
  contact: {
    title: "Contact form message",
    fields: [
      { name: "topic", label: "Topic", options: contactTopics },
      { name: "fullName", label: "Name" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "organisation", label: "Organisation" },
      { name: "message", label: "Message" },
    ],
  },
  report: {
    title: "Report",
    fields: [
      { name: "reportType", label: "Type of report", options: reportTypes },
      { name: "aboutLeader", label: "About a leader", options: reportSubjects },
      { name: "description", label: "What happened" },
      { name: "whenHappened", label: "When" },
      { name: "whereHappened", label: "Where" },
      { name: "peopleInvolved", label: "People involved" },
      { name: "fullName", label: "Reporter's name" },
      { name: "phone", label: "Reporter's phone" },
      { name: "email", label: "Reporter's email" },
    ],
  },
  "support-application": {
    title: "Application for support",
    fields: [
      { name: "applicantType", label: "Who is applying", options: applicantTypes },
      { name: "applicantName", label: "Applicant's name" },
      { name: "phone", label: "Phone" },
      { name: "email", label: "Email" },
      { name: "organisation", label: "School or organisation" },
      { name: "childFirstName", label: "Child's first name" },
      { name: "childAge", label: "Child's age" },
      { name: "region", label: "Region" },
      { name: "district", label: "District" },
      { name: "community", label: "Town or community" },
      { name: "schoolStatus", label: "School situation", options: schoolStatuses },
      { name: "supportNeeded", label: "Support needed", options: supportTypes },
      { name: "situation", label: "Why support is needed" },
      { name: "accessNeeds", label: "Disability or access needs" },
      { name: "consent", label: "Has permission to share these details" },
    ],
  },
};

export function isIntakeKind(value: string): value is IntakeKind {
  return Object.hasOwn(formFields, value);
}

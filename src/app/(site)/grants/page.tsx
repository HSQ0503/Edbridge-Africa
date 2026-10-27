import type { Metadata } from "next";
import { Check, FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { ContactForm } from "../contact/contact-form";

export const metadata: Metadata = {
  title: "Grants and projects",
  description: "Information for foundations, governments and institutional funders working with EdBridge Africa.",
};

const strengths = [
  "Projects designed with communities, schools and local government",
  "Monitoring, evaluation and learning built into every project",
  "Safeguarding, data protection and consent procedures for work with children",
  "Separated financial duties: every payment is prepared, approved and reconciled by different people",
  "Clear reporting on milestones, spending and outcomes, on your schedule",
];

const dueDiligence = [
  "Certificate of registration and constitution",
  "Board of Directors list and governance policies",
  "Most recent audited financial statements",
  "Child Safeguarding Policy and Code of Conduct",
  "Anti-fraud, anti-corruption and whistleblowing policies",
  "Data protection registration and Privacy Policy",
];

export default function GrantsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Grants and projects"
        intro="For foundations, governments and institutions: how we design, deliver and report on funded projects."
      />

      <Section id="why-fund" title="What funders can expect">
        <ul className="max-w-3xl space-y-3">
          {strengths.map((item) => (
            <li key={item} className="flex gap-3">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="funded-projects" tone="sand" title="Funded projects">
        <EmptyState icon={<FolderOpen className="size-6" />} title="Funded projects will be listed here">
          <p>Each project will show its funder, goals, communities served, timeline and published reports.</p>
        </EmptyState>
      </Section>

      <Section
        id="due-diligence"
        title="Due diligence pack"
        intro="These documents are available to prospective funders on request."
      >
        <ul className="grid max-w-4xl gap-3 sm:grid-cols-2">
          {dueDiligence.map((item) => (
            <li key={item} className="flex gap-3">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="enquire" tone="sand" title="Talk to us about funding">
        <div className="max-w-2xl">
          <ContactForm defaultTopic="grants" />
        </div>
      </Section>
    </>
  );
}

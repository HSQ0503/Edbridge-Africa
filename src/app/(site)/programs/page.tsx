import type { Metadata } from "next";
import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";
import { ProgramIcon } from "@/components/program-icon";
import { Section } from "@/components/section";
import { ButtonLink } from "@/components/button-link";
import { programHref, programs } from "@/content/programs";

export const metadata: Metadata = {
  title: "Programs and core activities",
  description:
    "EdBridge Africa's programs: education access and scholarships, disability inclusion, literacy and numeracy, digital skills and STEM, youth careers, families and communities, and child protection.",
};

const supportSteps = [
  { title: "Identify", text: "We find children who need support through families, schools, community partners and online applications." },
  { title: "Assess", text: "A trained officer meets the family to understand the child's education, circumstances and access needs." },
  { title: "Approve", text: "A separate reviewer checks the recommendation, so no one approves their own assessment." },
  { title: "Support", text: "We provide the agreed support — fees, supplies, tutoring, devices or accommodations — and record it." },
  { title: "Follow up", text: "We check attendance and progress, and adjust support so children stay in school." },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Programs and core activities"
        intro="Our programs work together to get children into school, keep them learning and prepare them for the future."
      />

      <Section id="all-programs" title="Our programs">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <li key={program.slug}>
              <LinkCard
                href={programHref(program)}
                title={program.title}
                description={program.summary}
                icon={<ProgramIcon name={program.icon} />}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="how-support-works"
        tone="sand"
        title="How support works"
        intro="Every child we support goes through the same fair, recorded process."
      >
        <ol className="grid gap-4 md:grid-cols-5">
          {supportSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-serif text-sm font-bold text-accent-text">Step {index + 1}</p>
              <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-base text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/apply">Apply for support</ButtonLink>
          <ButtonLink href="/donate" variant="secondary">
            Fund a child&apos;s support
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}

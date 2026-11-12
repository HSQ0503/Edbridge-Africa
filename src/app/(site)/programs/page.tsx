import type { Metadata } from "next";
import Link from "next/link";
import { LinkCard } from "@/components/link-card";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";
import { ButtonLink } from "@/components/button-link";
import { programHref, programNumber, programs } from "@/content/programs";

export const metadata: Metadata = {
  title: "Programs and core activities",
  description:
    "EdBridge Africa's eight programs: education access and inclusion, literacy and numeracy, digital and STEM education, careers and enterprise, teachers and communities, infrastructure and child welfare, agricultural and climate education, and research and partnerships.",
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
        intro="Eight interconnected areas of focus that get children into school, keep them learning and prepare them for the future."
      />

      <Section id="all-programs" title="Our programs and areas of focus">
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program, index) => (
            <li key={program.slug}>
              <LinkCard
                swatch={index}
                label={programNumber(index)}
                href={programHref(program)}
                title={program.title}
                description={program.summary}
              />
            </li>
          ))}
        </ul>
        <p className="mt-12 max-w-3xl border-t border-line pt-6 text-lg">
          Disability inclusion, accessibility, equality and the protection and well-being of children and young people
          run through all eight.{" "}
          <Link href="/disability-inclusion" className="link font-medium">
            How we make every program inclusive
          </Link>
        </p>
      </Section>

      <Section
        id="how-support-works"
        tone="sand"
        title="How support works"
        intro="Every child we support goes through the same fair, recorded process."
      >
        <SceneSplit scene="stairs" count={5} side="left">
          <ol className="space-y-5">
            {supportSteps.map((step, index) => (
              <li key={step.title} className="border-line sm:border-t sm:pt-5">
                <p className="text-label font-medium tabular-nums text-muted">Step {index + 1}</p>
                <h3 className="mt-1 text-lg">{step.title}</h3>
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
        </SceneSplit>
      </Section>
    </>
  );
}

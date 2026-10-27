import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Careers and job opportunities",
  description: "Job opportunities at EdBridge Africa and how we recruit safely.",
};

const recruitmentSteps = [
  "Apply online with your CV and a short statement",
  "Shortlisting against the published job description",
  "Interview, including questions about safeguarding",
  "Reference checks and a police background check for roles involving children",
  "Offer, induction and safeguarding training",
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Careers and job opportunities"
        intro="Join a team working to widen access to education for children and young people across Ghana."
      />

      <Section id="vacancies" title="Current vacancies">
        <EmptyState icon={<Briefcase className="size-6" />} title="There are no open positions right now">
          <p>
            New roles will be listed here with a full job description and an online application form. You can also{" "}
            <Link href="/volunteer" className="font-semibold text-brand underline">
              volunteer with us
            </Link>
            .
          </p>
        </EmptyState>
      </Section>

      <Section id="safer-recruitment" tone="sand" title="How we recruit">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="prose">
            <p>
              EdBridge Africa is an equal opportunities employer. We welcome applications from people with disabilities
              and will make reasonable adjustments at every stage — just tell us what you need.
            </p>
            <p>
              We are committed to safeguarding children. Everyone who works with us is checked before they start and
              must follow our <Link href="/safeguarding">Child Safeguarding Policy</Link> and Code of Conduct.
            </p>
          </div>
          <ol className="space-y-3">
            {recruitmentSteps.map((step, index) => (
              <li key={step} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-on-brand"
                >
                  {index + 1}
                </span>
                <span className="text-base">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}

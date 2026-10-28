import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getOpenJobs } from "@/cms/queries";
import { FormattedDate } from "@/components/date";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Careers and job opportunities",
  description: "Job opportunities at EdBridge Africa and how we recruit safely.",
};

const recruitmentSteps = [
  "Apply with your CV and a short statement, as described in the vacancy",
  "Shortlisting against the published job description",
  "Interview, including questions about safeguarding",
  "Reference checks and a police background check for roles involving children",
  "Offer, induction and safeguarding training",
];

export default async function CareersPage() {
  const jobs = await getOpenJobs();
  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Careers and job opportunities"
        intro="Join a team working to widen access to education for children and young people across Ghana."
      />

      <Section id="vacancies" title="Current vacancies">
        {jobs.length ? (
          <ul className="grid gap-6 lg:grid-cols-2">
            {jobs.map((job) => (
              <li key={job.id} className="space-y-2 rounded-2xl border border-line bg-surface p-5">
                <h3 className="text-xl font-bold">
                  <Link href={`/careers/${job.slug}`} className="text-ink no-underline hover:underline">
                    {job.title}
                  </Link>
                </h3>
                <p className="text-base font-semibold text-accent-text">
                  {job.department} · {job.location}
                </p>
                <p className="text-base text-muted">{job.summary}</p>
                <p className="text-base">
                  Closing date: <FormattedDate value={job.closingDate} />
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Briefcase className="size-6" />} title="There are no open positions right now">
            <p>
              New roles will be listed here with a full job description. You can also{" "}
              <Link href="/volunteer" className="font-semibold text-brand underline">
                volunteer with us
              </Link>
              .
            </p>
          </EmptyState>
        )}
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

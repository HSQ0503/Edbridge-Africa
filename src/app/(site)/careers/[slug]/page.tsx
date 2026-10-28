import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getJob, getOpenJobs } from "@/cms/queries";
import { Container } from "@/components/container";
import { Checkbox, FieldGroup, FileField, TextArea, TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { FormattedDate } from "@/components/date";
import { Notice } from "@/components/notice";
import { RichText } from "@/components/rich-text";
import { applyForJob } from "./actions";

// Cache Components needs at least one param; the placeholder renders as not found.
const NO_JOBS = "__none__";

export async function generateStaticParams() {
  const jobs = await getOpenJobs();
  return jobs.length ? jobs.map((job) => ({ slug: job.slug })) : [{ slug: NO_JOBS }];
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const job = await getJob((await params).slug);
  return job ? { title: job.title, description: job.summary } : {};
}

const employmentTypes = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Fixed-term contract",
  internship: "Internship",
} as const;

async function Vacancy({ params }: Pick<PageProps<"/careers/[slug]">, "params">) {
  const job = await getJob((await params).slug);
  if (!job) notFound();

  return (
    <article>
      <header className="bg-sand py-12 sm:py-16">
        <Container className="max-w-3xl space-y-4">
          <p>
            <Link href="/careers" className="inline-flex items-center gap-1 font-semibold text-brand underline">
              <ArrowLeft aria-hidden="true" className="size-4" /> Careers
            </Link>
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">{job.title}</h1>
          <p className="text-lg text-muted">{job.summary}</p>
        </Container>
      </header>
      <Container className="max-w-3xl space-y-8 py-12">
        {job.closed && <Notice title="This vacancy has closed" />}
        <dl className="grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Department</dt>
            <dd>{job.department}</dd>
          </div>
          <div>
            <dt className="font-semibold">Location</dt>
            <dd>{job.location}</dd>
          </div>
          <div>
            <dt className="font-semibold">Type</dt>
            <dd>{employmentTypes[job.employmentType]}</dd>
          </div>
          <div>
            <dt className="font-semibold">Closing date</dt>
            <dd>
              <FormattedDate value={job.closingDate} />
            </dd>
          </div>
        </dl>
        {job.involvesChildren && (
          <Notice title="This role involves working with children">
            <p>The successful applicant will need a police background check and safeguarding training before starting.</p>
          </Notice>
        )}
        <RichText data={job.description} />
        {!job.closed && (
          <section aria-labelledby="apply-heading" className="space-y-6 border-t border-line pt-10">
            <h2 id="apply-heading" className="text-2xl font-bold">
              Apply for this role
            </h2>
            <FormShell
              action={applyForJob.bind(null, job.slug)}
              submitLabel="Send application"
              successTitle="Thank you — we have received your application"
              successMessage="Our recruitment team will be in touch after the closing date."
            >
              <FieldGroup title="About you">
                <TextField name="fullName" label="Full name" required autoComplete="name" />
                <TextField name="email" label="Email address" type="email" required autoComplete="email" />
                <TextField name="phone" label="Phone number" type="tel" required autoComplete="tel" />
                <TextField name="location" label="Town or city where you live" required autoComplete="address-level2" />
              </FieldGroup>
              <FieldGroup title="Your application">
                <FileField
                  name="cv"
                  label="Your CV"
                  required
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  hint="A PDF or Word document (.docx), smaller than 4 MB. If the form shows an error, choose the file again."
                />
                <TextArea
                  name="statement"
                  label="Why are you applying?"
                  required
                  rows={7}
                  hint="Tell us why you want this role and what you would bring to it"
                />
                <TextArea
                  name="adjustments"
                  label="Do you need any adjustments for an interview?"
                  rows={3}
                  hint="For example, a sign language interpreter, step-free access or extra time"
                />
                <Checkbox
                  name="privacyConsent"
                  label="I agree that EdBridge Africa can use my details to consider my application"
                  hint="Only our recruitment team will see your application. Read our privacy policy to find out more."
                />
              </FieldGroup>
            </FormShell>
          </section>
        )}
      </Container>
    </article>
  );
}

export default function VacancyPage({ params }: PageProps<"/careers/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-72 bg-sand" />}>
      <Vacancy params={params} />
    </Suspense>
  );
}

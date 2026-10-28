import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/cms/queries";
import { FieldGroup, RadioGroup, TextArea, TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { submitReport } from "./actions";
import { reportSubjects, reportTypes } from "./options";

export const metadata: Metadata = {
  title: "Complaints and reporting",
  description:
    "Report a concern about a child, make a complaint, report fraud or misconduct, or give feedback to EdBridge Africa — anonymously if you prefer.",
};

const nextSteps = [
  {
    title: "Concerns about a child",
    text: "Our Safeguarding Lead is alerted straight away and will act to keep the child safe, working with Social Welfare, the police or health services where needed.",
  },
  {
    title: "Complaints",
    text: "We acknowledge every complaint, look into it fairly and tell you what we found and what we will do.",
  },
  {
    title: "Fraud or misconduct",
    text: "Reports are handled confidentially by our compliance team and never shared with the person they are about.",
  },
  {
    title: "Reports about our leaders",
    text: "Reports about the Executive Director or their Deputy go only to the Board Chair. Reports about the Safeguarding Lead go to the Executive Director and the Board Chair.",
  },
];

export default async function ReportPage() {
  const { emergencyNumbers } = await getSiteSettings();
  return (
    <>
      <PageHeader
        eyebrow="Complaints and reporting"
        title="Report a concern or make a complaint"
        intro="You can tell us about a concern for a child's safety, make a complaint, report fraud or misconduct, or give feedback. You don't have to give your name."
      >
        <div className="max-w-2xl">
          <Notice tone="urgent" title="If a child is in immediate danger">
            <p>Call the emergency services now: {emergencyNumbers}.</p>
          </Notice>
        </div>
      </PageHeader>

      <Section id="report">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">Tell us what happened</h2>
            <p className="mt-2 text-base text-muted">
              Share as much as you know. Don&apos;t include more personal details about other people than we need to
              act.
            </p>
            <div className="mt-8">
              <FormShell
                action={submitReport}
                submitLabel="Send report"
                successTitle="Thank you — we have received your report"
                successMessage="The right person in our team will look at it. If you gave contact details, we will be in touch."
              >
                <FieldGroup title="What you're reporting">
                  <RadioGroup
                    name="reportType"
                    legend="What would you like to tell us about?"
                    required
                    options={[...reportTypes]}
                  />
                  <RadioGroup
                    name="aboutLeader"
                    legend="Is your report about one of these people?"
                    hint="We ask so your report never reaches the person it is about"
                    options={[...reportSubjects]}
                  />
                  <TextArea
                    name="description"
                    label="What happened?"
                    required
                    rows={7}
                    hint="Describe what you saw, heard or were told"
                  />
                  <TextField name="whenHappened" label="When did it happen?" hint="An approximate date or time is fine" />
                  <TextField name="whereHappened" label="Where did it happen?" />
                  <TextArea
                    name="peopleInvolved"
                    label="Who was involved?"
                    rows={3}
                    hint="Names or roles, if you know them"
                  />
                </FieldGroup>

                <FieldGroup
                  title="Your contact details"
                  description="Leave these blank to report anonymously. If you share them, we can update you and ask questions if we need to."
                >
                  <TextField name="fullName" label="Your name" autoComplete="name" />
                  <TextField name="phone" label="Phone number" type="tel" autoComplete="tel" />
                  <TextField name="email" label="Email address" type="email" autoComplete="email" />
                </FieldGroup>
              </FormShell>
            </div>
          </div>

          <aside aria-labelledby="what-happens-next" className="h-fit space-y-6">
            <h2 id="what-happens-next" className="text-2xl font-bold">
              What happens next
            </h2>
            <ul className="space-y-4">
              {nextSteps.map((step) => (
                <li key={step.title} className="rounded-2xl border border-line bg-surface p-5">
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-base text-muted">{step.text}</p>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-line bg-surface p-5 text-base">
              <h3 className="text-lg font-bold">Other ways to report</h3>
              <p className="mt-1 text-muted">
                You can also call us or tell any member of staff. Read the{" "}
                <Link href="/safeguarding#easy-read" className="font-semibold text-brand underline">
                  easy read guide
                </Link>{" "}
                to how we keep children safe.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

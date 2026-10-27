import type { Metadata } from "next";
import Link from "next/link";
import {
  Checkbox,
  CheckboxGroup,
  FieldGroup,
  RadioGroup,
  SelectField,
  TextArea,
  TextField,
} from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { submitApplication } from "./actions";
import { applicantTypes, regionOptions, schoolStatuses, supportTypes } from "./options";

export const metadata: Metadata = {
  title: "Apply for support",
  description:
    "Apply for education support from EdBridge Africa for a child or young person, or refer a learner from your school.",
};

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Apply for support"
        title="Apply for education support"
        intro="Tell us about a child or young person who needs help to get into school, stay in school or take the next step. A member of our team will contact you."
      />

      <Section id="apply">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Application form</h2>
            <FormShell
              action={submitApplication}
              submitLabel="Send application"
              successTitle="Thank you — we have received your application"
              successMessage="A member of our team will call you to talk about the child's needs. This usually involves a visit before any support is agreed."
            >
              <FieldGroup title="About you">
                <RadioGroup name="applicantType" legend="Who is applying?" required options={[...applicantTypes]} />
                <TextField name="applicantName" label="Your full name" required autoComplete="name" />
                <TextField
                  name="phone"
                  label="Phone number"
                  type="tel"
                  required
                  autoComplete="tel"
                  hint="We will call you on this number"
                />
                <TextField name="email" label="Email address" type="email" autoComplete="email" />
                <TextField
                  name="organisation"
                  label="School or organisation name"
                  hint="Only if you are applying on behalf of a school or organisation"
                  autoComplete="organization"
                />
              </FieldGroup>

              <FieldGroup
                title="About the child or young person"
                description="We only ask for what we need now. We'll collect anything else in person."
              >
                <TextField name="childFirstName" label="First name" required className="sm:max-w-sm" />
                <TextField
                  name="childAge"
                  label="Age in years"
                  required
                  inputMode="numeric"
                  className="w-24"
                  hint="An estimate is fine if you are not sure"
                />
                <SelectField name="region" label="Region" required options={regionOptions} />
                <TextField name="district" label="District" required />
                <TextField name="community" label="Town or community" required />
                <RadioGroup
                  name="schoolStatus"
                  legend="What is their school situation?"
                  required
                  options={[...schoolStatuses]}
                />
              </FieldGroup>

              <FieldGroup title="Support needed">
                <CheckboxGroup
                  name="supportNeeded"
                  legend="What support is needed?"
                  hint="Choose all that apply"
                  required
                  options={[...supportTypes]}
                />
                <TextArea
                  name="situation"
                  label="Why is support needed?"
                  required
                  hint="A few sentences about what is making it hard to go to or stay in school"
                />
                <TextArea
                  name="accessNeeds"
                  label="Does the child have a disability or need any support to take part?"
                  rows={3}
                  hint="For example, a wheelchair, hearing support, large print or a sign language interpreter"
                />
              </FieldGroup>

              <FieldGroup title="Permission">
                <Checkbox
                  name="consent"
                  label="I am the child's parent or guardian, or I have their permission to share these details"
                  hint="We will only use this information to contact you about support, and we keep it secure."
                />
                <p className="text-base">
                  Read our{" "}
                  <Link href="/privacy" className="font-semibold text-brand underline">
                    Privacy Policy
                  </Link>{" "}
                  to see how we protect children&apos;s information.
                </p>
              </FieldGroup>
            </FormShell>
          </div>

          <aside aria-labelledby="before-you-apply" className="h-fit space-y-4">
            <h2 id="before-you-apply" className="text-2xl font-bold">
              Before you apply
            </h2>
            <Notice title="Under 18?">
              <p>Please ask a parent, guardian or teacher to apply with you, or call us and we will help.</p>
            </Notice>
            <div className="rounded-2xl border border-line bg-surface p-5 text-base">
              <h3 className="text-lg font-bold">What happens next</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
                <li>We call you to talk about the application</li>
                <li>A trained officer visits to understand the child&apos;s needs</li>
                <li>A separate reviewer decides what support we can offer</li>
                <li>We tell you the decision and arrange support</li>
              </ol>
            </div>
            <p className="text-base text-muted">
              Applying doesn&apos;t guarantee support, but every application is reviewed fairly. Prefer to talk?{" "}
              <Link href="/contact" className="font-semibold text-brand underline">
                Contact us
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}

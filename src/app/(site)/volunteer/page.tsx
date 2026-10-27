import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Checkbox, CheckboxGroup, FieldGroup, RadioGroup, TextArea, TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { submitVolunteer } from "./actions";
import { volunteerAvailability, volunteerInterests } from "./options";

export const metadata: Metadata = {
  title: "Volunteer registration",
  description: "Volunteer with EdBridge Africa as a tutor, mentor, digital skills trainer or community volunteer.",
};

const requirements = [
  "You are 18 or older",
  "A police background check for roles involving children",
  "Two references",
  "Safeguarding training before you start, and our Code of Conduct",
];

export default function VolunteerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Volunteer with us"
        intro="Share your time and skills to help children and young people learn, grow and stay in school. Volunteers from Ghana and abroad are welcome."
      />

      <Section id="before-you-apply" tone="sand" title="Before you apply">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="prose">
            <p>
              Because our volunteers work with children, everyone goes through safer recruitment checks before they
              start. This protects the children we serve and you.
            </p>
            <p>
              International volunteers are welcome. We will talk to you about visas, accommodation and the support we
              can offer before you commit.
            </p>
            <p>
              Need support to volunteer, such as an interpreter or accessible materials? Tell us in the form — we
              welcome volunteers with disabilities.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h3 className="text-xl font-bold">What we ask of volunteers</h3>
            <ul className="mt-4 space-y-2 text-base">
              {requirements.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="apply" title="Volunteer application">
        <div className="max-w-2xl">
          <FormShell
            action={submitVolunteer}
            submitLabel="Send application"
            successTitle="Thank you for applying to volunteer"
            successMessage="Our Volunteer Coordinator will review your application and contact you about next steps."
          >
            <FieldGroup title="About you">
              <TextField name="fullName" label="Full name" required autoComplete="name" />
              <TextField name="email" label="Email address" type="email" required autoComplete="email" />
              <TextField
                name="phone"
                label="Phone number"
                type="tel"
                required
                autoComplete="tel"
                hint="Include the country code if you are outside Ghana"
              />
              <TextField
                name="location"
                label="Where do you live?"
                required
                hint="Town or city, and country"
                autoComplete="address-level2"
              />
              <Checkbox name="ageConfirmed" label="I am 18 years old or older" />
            </FieldGroup>

            <FieldGroup title="How you'd like to help">
              <CheckboxGroup
                name="interests"
                legend="What would you like to help with?"
                hint="Choose all that apply"
                required
                options={[...volunteerInterests]}
              />
              <RadioGroup
                name="availability"
                legend="When are you available?"
                required
                options={[...volunteerAvailability]}
              />
              <TextArea
                name="experience"
                label="Your skills and experience"
                required
                hint="Tell us about relevant work, study or volunteering, especially with children or young people"
              />
              <TextArea
                name="accessNeeds"
                label="Is there anything we can do to support you as a volunteer?"
                rows={3}
                hint="For example, an interpreter, accessible materials or flexible hours"
              />
              <TextField name="heardAbout" label="How did you hear about us?" />
            </FieldGroup>

            <FieldGroup title="Safeguarding and privacy">
              <Checkbox
                name="safeguardingAcknowledged"
                label="I understand that volunteers who work with children need a police check, references and safeguarding training"
              />
              <Checkbox
                name="privacyConsent"
                label="I agree that EdBridge Africa can use my details to process my application"
                hint="We keep your information secure and only share it with the staff handling volunteer applications."
              />
              <p className="text-base">
                Read our{" "}
                <Link href="/privacy" className="font-semibold text-brand underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/safeguarding" className="font-semibold text-brand underline">
                  Child Safeguarding Policy
                </Link>
                .
              </p>
            </FieldGroup>
          </FormShell>
        </div>
      </Section>
    </>
  );
}

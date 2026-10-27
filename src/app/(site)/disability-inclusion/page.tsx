import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { getProgram } from "@/content/programs";

export const metadata: Metadata = {
  title: "Disability inclusion and accessibility",
  description:
    "How EdBridge Africa makes education and every program accessible to children and young people with disabilities.",
};

const principles = [
  {
    title: "Remove barriers, not expectations",
    text: "Disability comes from barriers in the environment — steps, inaccessible materials, attitudes. Our job is to remove them.",
  },
  {
    title: "Twin-track support",
    text: "We make every program inclusive and also provide targeted support such as devices, Braille or sign language where a child needs it.",
  },
  {
    title: "Nothing about us without us",
    text: "We involve children with disabilities, their families and disability organisations in planning and reviewing our work.",
  },
];

export default function DisabilityInclusionPage() {
  const program = getProgram("disability-inclusion");

  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Disability inclusion and accessibility"
        intro="Children and young people with disabilities have the same right to learn as everyone else. We make sure disability is never the reason a child misses out."
      />

      <Section id="sign-language" title="In Ghanaian Sign Language">
        <div className="max-w-2xl">
          <Notice title="Ghanaian Sign Language video coming soon">
            <p>A signed version of this page, with captions and a transcript, will be added here.</p>
          </Notice>
        </div>
      </Section>

      <Section id="approach" tone="sand" title="Our approach">
        <ul className="grid gap-6 md:grid-cols-3">
          {principles.map((principle) => (
            <li key={principle.title} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-xl font-bold">{principle.title}</h3>
              <p className="mt-2 text-base text-muted">{principle.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="what-we-do" title="What we do">
        <ul className="grid max-w-4xl gap-3 sm:grid-cols-2">
          {program?.activities.map((activity) => (
            <li key={activity} className="flex gap-3">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="accommodations" tone="sand" title="Requesting support or an accommodation">
        <div className="prose">
          <p>
            If your child needs support to go to school or to take part in an EdBridge program — for example a device,
            accessible materials, a sign language interpreter or changes to how an activity is run — tell us when you{" "}
            <Link href="/apply">apply for support</Link>, or contact us at any time.
          </p>
          <p>
            You can also ask for accommodations to attend our events or to use this website. We will work with you to
            find what works.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/apply">Apply for support</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </Section>

      <Section id="website-accessibility" title="Accessibility of this website">
        <p className="max-w-2xl">
          We aim for this website to meet WCAG 2.2 level AA. Read our{" "}
          <Link href="/accessibility" className="font-semibold text-brand underline">
            accessibility statement
          </Link>{" "}
          to see what we have done, what we are still working on and how to tell us about a problem.
        </p>
      </Section>
    </>
  );
}

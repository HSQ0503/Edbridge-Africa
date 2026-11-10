import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";
import { ContactForm } from "../contact/contact-form";

export const metadata: Metadata = {
  title: "Corporate and institutional partnerships",
  description: "How companies, foundations, universities and institutions can partner with EdBridge Africa.",
};

const models = [
  {
    title: "Program funding",
    text: "Fund a program, a district or a cohort of learners, with clear milestones and regular impact reports.",
  },
  {
    title: "Giving in kind",
    text: "Donate computers, books, school supplies or assistive technology — we'll make sure it reaches the children who need it.",
  },
  {
    title: "Skills and employee volunteering",
    text: "Share expertise in technology, finance, careers and more, or mentor young people through our youth programs.",
  },
  {
    title: "Universities and NGOs",
    text: "Collaborate on research, internships, international volunteering and joint projects.",
  },
];

const partnerBenefits = [
  "A named contact and a partnership agreement with agreed goals",
  "Regular reports on activities, spending and outcomes",
  "Recognition on our website and in our publications, where you'd like it",
  "Opportunities for your staff to see the work first-hand",
];

export default function PartnershipsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Corporate and institutional partnerships"
        intro="Partner with us to widen access to education and opportunity for children and young people in Ghana."
      />

      <Section id="ways-to-partner" title="Ways to partner">
        <ul className="grid gap-6 sm:grid-cols-2">
          {models.map(({ title, text }) => (
            <li key={title} className="border-line sm:border-t sm:pt-6">
              <h3 className="text-xl">{title}</h3>
              <p className="mt-2 text-base text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="what-partners-get" tone="sand" title="What partners can expect">
        <SceneSplit scene="converge" shift={2}>
          <ul className="prose list-disc">
            {partnerBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-base text-muted">
            To protect children, partner publicity follows our safeguarding rules: we only use photos and stories with
            consent, and never share where a child lives or goes to school.
          </p>
        </SceneSplit>
      </Section>

      <Section id="enquire" title="Start a conversation">
        <div className="max-w-2xl">
          <ContactForm defaultTopic="partnership" />
        </div>
      </Section>
    </>
  );
}

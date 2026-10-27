import type { Metadata } from "next";
import { Building2, Gift, GraduationCap, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { ContactForm } from "../contact/contact-form";

export const metadata: Metadata = {
  title: "Corporate and institutional partnerships",
  description: "How companies, foundations, universities and institutions can partner with EdBridge Africa.",
};

const models = [
  {
    icon: Building2,
    title: "Program funding",
    text: "Fund a program, a district or a cohort of learners, with clear milestones and regular impact reports.",
  },
  {
    icon: Gift,
    title: "Giving in kind",
    text: "Donate computers, books, school supplies or assistive technology — we'll make sure it reaches the children who need it.",
  },
  {
    icon: Lightbulb,
    title: "Skills and employee volunteering",
    text: "Share expertise in technology, finance, careers and more, or mentor young people through our youth programs.",
  },
  {
    icon: GraduationCap,
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
          {models.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-line bg-surface p-6">
              <Icon aria-hidden="true" className="size-8 text-brand" />
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-base text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="what-partners-get" tone="sand" title="What partners can expect">
        <ul className="prose list-disc">
          {partnerBenefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-base text-muted">
          To protect children, partner publicity follows our safeguarding rules: we only use photos and stories with
          consent, and never share where a child lives or goes to school.
        </p>
      </Section>

      <Section id="enquire" title="Start a conversation">
        <div className="max-w-2xl">
          <ContactForm defaultTopic="partnership" />
        </div>
      </Section>
    </>
  );
}

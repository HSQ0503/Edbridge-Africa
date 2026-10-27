import type { Metadata } from "next";
import { DraftNotice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Mission, vision and objectives",
  description: "EdBridge Africa's mission, vision and strategic objectives.",
};

const objectives = [
  "Identify out-of-school children and young people and support them to enrol, re-enter and stay in school.",
  "Remove financial and practical barriers to education through scholarships, school supplies and targeted assistance.",
  "Ensure children and young people with disabilities can access education and take part fully in every program.",
  "Strengthen literacy, numeracy and academic achievement through tutoring, remedial learning and reading programs.",
  "Build digital, ICT and STEM skills that prepare young people for further learning and work.",
  "Prepare young people for employment and enterprise through career guidance, vocational training and mentorship.",
  "Engage families, schools and communities as partners in every child's education.",
  "Keep children safe through strong safeguarding, child protection and wellbeing support.",
  "Operate with transparency and accountability to children, families, donors and partners.",
];

export default function MissionPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Mission, vision and objectives"
        intro="What we are working towards, and how we will get there."
      >
        <div className="max-w-2xl">
          <DraftNotice />
        </div>
      </PageHeader>

      <Section id="mission-vision">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-t-4 border-brand bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Our mission</h2>
            <p className="mt-4 text-lg">
              To widen access to quality education and opportunity for children and young people in Ghana — especially
              those with disabilities and those at risk of being left behind — by working hand in hand with families,
              schools and communities.
            </p>
          </div>
          <div className="rounded-2xl border-t-4 border-accent bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Our vision</h2>
            <p className="mt-4 text-lg">
              A Ghana where every child and young person can learn, belong and build the future they choose.
            </p>
          </div>
        </div>
      </Section>

      <Section id="objectives" tone="sand" title="Our objectives">
        <ol className="grid gap-4 md:grid-cols-2">
          {objectives.map((objective, index) => (
            <li key={objective} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand font-serif font-bold text-on-brand"
              >
                {index + 1}
              </span>
              <p className="text-base">{objective}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

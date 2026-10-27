import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Briefcase, GraduationCap, Users } from "lucide-react";
import { DraftNotice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "About us",
  description: "Who EdBridge Africa is, who we serve and how we work with communities across Ghana.",
};

const groupsWeServe = [
  { icon: GraduationCap, title: "Out-of-school children", text: "Children and young people who have never enrolled, have dropped out or are at risk of leaving school." },
  { icon: Accessibility, title: "Children with disabilities", text: "Learners who face barriers to access, participation and accessible learning materials." },
  { icon: Briefcase, title: "Young people", text: "Young people preparing for further education, vocational training, work or enterprise." },
  { icon: Users, title: "Families and communities", text: "Parents, caregivers, schools and community leaders working to support children's education." },
];

const values = [
  { title: "Inclusion", text: "Every program is designed so children with disabilities and other marginalised children can take part fully." },
  { title: "Dignity", text: "We tell stories with consent and respect, and we treat every family as a partner, not a case." },
  { title: "Safety", text: "Safeguarding comes first. We protect children's wellbeing and their personal information." },
  { title: "Partnership", text: "We work alongside families, schools, government and local organisations." },
  { title: "Accountability", text: "We record, review and report how resources are used and what difference they make." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Opening the door to education for every child"
        intro="EdBridge Africa is a nonprofit organisation in Ghana working on education access, child and youth development, disability inclusion and community empowerment."
      />

      <Section id="who-we-are" title="Who we are">
        <div className="prose">
          <p>
            Too many children in Ghana are out of school, or in school but not learning — because of costs, distance,
            disability, family pressures or a lack of support. EdBridge Africa exists to close that gap.
          </p>
          <p>
            We identify children and young people who need support, understand the barriers they face, and provide
            practical help: scholarships and school supplies, accessible learning, tutoring, digital skills, career
            preparation and safeguarding. We work closely with families, schools and communities so that support lasts.
          </p>
        </div>
      </Section>

      <Section id="who-we-serve" tone="sand" title="Who we serve">
        <ul className="grid gap-6 sm:grid-cols-2">
          {groupsWeServe.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-6">
              <Icon aria-hidden="true" className="size-8 shrink-0 text-brand" />
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-1 text-base text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="where-we-work" title="Where we work">
        <div className="max-w-3xl space-y-6">
          <p>
            We work with communities, schools and local partners in [regions and districts to be confirmed]. A map of
            the communities we serve will be added here.
          </p>
          <DraftNotice>
            <p>EdBridge Africa to confirm the regions and districts where programs currently operate.</p>
          </DraftNotice>
        </div>
      </Section>

      <Section id="values" tone="sand" title="How we work">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <li key={value.title} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-xl font-bold">{value.title}</h3>
              <p className="mt-2 text-base text-muted">{value.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="governance" title="Governance and accountability">
        <div className="prose">
          <p>
            EdBridge Africa is governed by an independent <Link href="/leadership">Board of Directors</Link> responsible
            for strategy, financial oversight and accountability. Our{" "}
            <Link href="/safeguarding">Child Safeguarding Policy</Link>, <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/report">complaints process</Link> apply to everyone who works with us.
          </p>
          <p>Annual reports and audited accounts will be published on our <Link href="/news#publications">publications</Link> page.</p>
        </div>
      </Section>
    </>
  );
}

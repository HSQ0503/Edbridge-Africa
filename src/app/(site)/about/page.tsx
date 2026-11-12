import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { ButtonLink } from "@/components/button-link";
import { DraftNotice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";

export const metadata: Metadata = {
  title: "About us",
  description: "Who EdBridge Africa is, who we serve and how we work with communities across Ghana.",
};

const groupsWeServe = [
  "Children from economically disadvantaged households",
  "Children who are out of school or at risk of dropping out",
  "Children and young people with disabilities",
  "Children with limited access to educational resources",
  "Young people from underserved and rural communities",
  "Young people facing unemployment or limited skills-development opportunities",
  "Families, educators and communities requiring educational support",
];

const approach = [
  { title: "Needs-based support", text: "Identifying beneficiaries through appropriate assessments and transparent selection processes." },
  { title: "Community participation", text: "Working with families, schools, educators and local communities." },
  { title: "Inclusive programming", text: "Integrating disability inclusion and accessibility across our activities." },
  { title: "Capacity building", text: "Developing knowledge, skills and confidence among children, young people and communities." },
  { title: "Strategic partnerships", text: "Collaborating with local and international institutions." },
  { title: "Monitoring and evaluation", text: "Assessing program outcomes and improving interventions." },
  { title: "Sustainability", text: "Promoting solutions that deliver long-term benefits." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Bridging barriers, empowering futures"
        intro="EdBridge Africa is a nonprofit organisation committed to bridging educational inequalities and expanding opportunities for vulnerable and underserved children and young people in Ghana."
      />

      <Section id="who-we-are" title="Who we are">
        <SceneSplit scene="bridge">
          <div className="prose">
            <p>
              We believe that every child deserves the opportunity to learn, grow, discover their potential and build a
              brighter future, regardless of their economic circumstances, family background, disability or
              geographical location.
            </p>
            <p>
              Our work focuses on improving access to quality and inclusive education, strengthening learning outcomes,
              promoting digital and technological literacy, developing practical and entrepreneurial skills, and
              empowering young people and communities. Through educational support, community engagement, strategic
              partnerships and sustainable development initiatives, we address the barriers that keep children and young
              people from education and from reaching their full potential.
            </p>
            <p>
              Education extends beyond the classroom. It includes the knowledge, skills, resources, confidence and
              opportunities people need to take part meaningfully in society and contribute to sustainable development.
            </p>
            <p>
              <Link href="/our-story">Read our founder&apos;s story</Link> to see where this work began.
            </p>
          </div>
        </SceneSplit>
      </Section>

      <Section id="who-we-serve" tone="sand" title="Who we serve">
        <SceneSplit scene="converge" side="left">
          <p className="max-w-2xl text-lg text-muted">
            We are particularly committed to reaching children who are out of school, those at risk of dropping out,
            children with disabilities and young people facing economic and social disadvantages.
          </p>
          <ul className="mt-8 grid gap-x-6 sm:grid-cols-2">
            {groupsWeServe.map((group) => (
              <li key={group} className="border-t border-line py-4 text-lg">
                {group}
              </li>
            ))}
          </ul>
        </SceneSplit>
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

      <Section id="approach" tone="sand" title="Our approach">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {approach.map((item) => (
            <li key={item.title} className="border-line sm:border-t sm:pt-6">
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-2 text-base text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link href="/mission#values" className="link inline-flex items-center gap-2 font-medium">
            Our core values <Arrow />
          </Link>
        </p>
      </Section>

      <Section id="commitment" tone="brand">
        <SceneSplit scene="ring">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl">
            Every child deserves to be seen, heard, protected and given an opportunity to succeed.
          </h2>
          <div className="mt-6 max-w-2xl space-y-4 text-lg text-on-brand-muted">
            <p>
              We treat every beneficiary with dignity, fairness and respect. We seek to protect children from abuse,
              exploitation, neglect and discrimination while promoting safe, supportive and inclusive learning
              environments.
            </p>
            <p>
              Disability, poverty, gender or social background should never prevent anyone from taking part in
              educational and developmental opportunities.
            </p>
          </div>
          <ButtonLink href="/safeguarding" variant="secondary" className="mt-6 text-on-brand">
            Our safeguarding commitment
          </ButtonLink>
        </SceneSplit>
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

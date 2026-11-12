import type { Metadata } from "next";
import { KenteFold } from "@/components/kente-fold";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";

export const metadata: Metadata = {
  title: "Mission, vision and values",
  description:
    "EdBridge Africa's vision, mission, purpose, core beliefs, core values, strategic objectives and long-term aspiration.",
};

const beliefs = [
  "Every child deserves access to quality education.",
  "Every young person deserves an opportunity to fulfil their potential.",
  "Poverty should never determine a child's educational future.",
  "Disability should never be a barrier to learning, participation or achievement.",
  "Education is a foundation for individual empowerment and societal development.",
  "Every community deserves opportunities to grow and prosper.",
  "Investing in children and young people is investing in the future of Africa.",
];

const values = [
  {
    title: "Equality and equity",
    text: "We promote fair access to educational opportunities and recognise that individuals may require different forms of support to achieve equitable outcomes.",
  },
  {
    title: "Inclusion and accessibility",
    text: "We strive to remove barriers affecting people with disabilities and promote meaningful participation in education and community development.",
  },
  {
    title: "Compassion and humanity",
    text: "We approach our work with empathy, kindness, dignity and respect for every individual.",
  },
  {
    title: "Innovation and excellence",
    text: "We embrace creativity, technology, research and effective solutions to address educational and community development challenges.",
  },
  {
    title: "Empowerment and self-reliance",
    text: "We equip individuals with knowledge, skills and opportunities to improve their circumstances and build independent futures.",
  },
  {
    title: "Integrity and accountability",
    text: "We uphold honesty, transparency, responsible resource management and accountability to our beneficiaries, donors and partners.",
  },
  {
    title: "Sustainability and responsibility",
    text: "We promote lasting solutions that strengthen communities, protect the environment and benefit future generations.",
  },
  {
    title: "Collaboration and partnership",
    text: "We believe meaningful change requires cooperation among individuals, communities, institutions, governments and development partners.",
  },
];

const objectives = [
  "Expand access to quality education for vulnerable and underserved children.",
  "Support children who are out of school or at risk of dropping out.",
  "Promote inclusive education and accessibility for children and young people with disabilities.",
  "Improve literacy, numeracy and academic development.",
  "Promote digital literacy, information technology, STEM and innovation.",
  "Develop vocational, technical and entrepreneurial skills among young people.",
  "Promote career development, mentorship and youth leadership.",
  "Strengthen teachers, parents, families and communities.",
  "Improve access to educational infrastructure and essential learning resources.",
  "Promote child welfare, protection and safeguarding.",
  "Advance agricultural, environmental and climate education.",
  "Encourage educational research, partnerships and community outreach.",
];

type StatementProps = { label: string; headline: string; children: React.ReactNode };

function Statement({ label, headline, children }: StatementProps) {
  return (
    <div className="border-t border-line pt-6">
      <h2 className="text-label font-medium text-muted">{label}</h2>
      <p className="mt-3 text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">{headline}</p>
      <div className="mt-6 space-y-4 text-lg text-muted">{children}</div>
    </div>
  );
}

export default function MissionPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Mission, vision and values"
        intro="What we believe, what we are working towards, and the values that guide how we get there."
      />

      <Section id="mission-vision">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Statement label="Our vision" headline="A future where every child can learn, thrive and succeed.">
            <p>
              We envision a future where every child and young person, regardless of disability, economic
              circumstances, family background or geographical location, has equal opportunities to access quality
              education, discover their abilities, develop their potential and build a brighter future.
            </p>
            <p>
              We aspire to contribute to an inclusive and empowered society in which education is accessible to all,
              young people are equipped with relevant knowledge and skills, communities are strengthened, and no
              individual is denied the opportunity to succeed because of circumstances beyond their control.
            </p>
          </Statement>
          <Statement label="Our mission" headline="Bridging the gap between children and opportunity.">
            <p>
              EdBridge Africa is committed to breaking financial, social and educational barriers that prevent
              vulnerable and underserved children and young people in Ghana from accessing quality education and
              achieving their full potential.
            </p>
            <p>
              We create opportunities through educational support, access to essential learning resources, mentorship,
              digital skills development, vocational training, personal development and inclusive community
              initiatives — so that children and young people who face educational disadvantages are not left behind,
              but receive the support, encouragement, resources and opportunities they need to thrive and succeed.
            </p>
          </Statement>
        </div>
      </Section>

      <Section id="purpose" tone="brand">
        <SceneSplit scene="cloth">
          <p className="text-label font-medium text-on-brand-muted">Our purpose</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Transforming educational challenges into opportunities for learning, empowerment and sustainable development.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-on-brand-muted">
            Our purpose is to help eliminate educational inequalities and create sustainable opportunities for
            vulnerable and underserved children and young people to access education, develop essential skills,
            achieve personal growth and participate meaningfully in society.
          </p>
        </SceneSplit>
      </Section>

      <Section id="beliefs" title="Our core beliefs">
        <ol className="max-w-4xl">
          {beliefs.map((belief, index) => (
            <li
              key={belief}
              className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-line py-5 sm:grid-cols-[4rem_1fr] sm:py-6"
            >
              <span aria-hidden="true" className="pt-1 text-label font-medium tabular-nums text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-2xl tracking-[-0.02em] sm:text-3xl">{belief}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="values" tone="sand" title="Our core values">
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <li key={value.title} className="group">
              <KenteFold shift={index} className="mb-6" />
              <h3 className="text-xl">{value.title}</h3>
              <p className="mt-2 text-base text-muted">{value.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="objectives" title="Our strategic objectives">
        <SceneSplit scene="stairs" count={4}>
          <ol className="grid gap-x-6 sm:grid-cols-2">
            {objectives.map((objective, index) => (
              <li key={objective} className="flex gap-4 border-t border-line py-4">
                <span aria-hidden="true" className="w-7 shrink-0 text-lg font-medium tabular-nums text-brand">
                  {index + 1}
                </span>
                <p className="text-base">{objective}</p>
              </li>
            ))}
          </ol>
        </SceneSplit>
      </Section>

      <Section id="aspiration" tone="sand" title="Our long-term aspiration">
        <SceneSplit scene="ring" side="left">
          <div className="prose">
            <p>
              We aspire to become a credible, impactful and internationally recognised African nonprofit organisation
              contributing to educational transformation, disability inclusion, youth empowerment and sustainable
              community development.
            </p>
            <p>
              Our ambition extends beyond providing immediate educational assistance. We seek to contribute to stronger
              educational systems, more inclusive communities, a skilled and innovative generation, and sustainable
              opportunities for future generations.
            </p>
          </div>
          <p className="mt-8 max-w-2xl border-l-2 border-accent pl-5 text-2xl tracking-[-0.02em]">
            We envision an Africa where education is not a privilege reserved for a few, but an opportunity accessible
            to all.
          </p>
        </SceneSplit>
      </Section>
    </>
  );
}

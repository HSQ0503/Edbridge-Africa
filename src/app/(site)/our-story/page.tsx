import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";
import { getProgram, programHref, programNumber, programs } from "@/content/programs";

export const metadata: Metadata = {
  title: "Our founder's story",
  description:
    "How our founder's own struggle to stay in school — losing his father at six, dropping out, and repairing a discarded shoe to attend high school — became EdBridge Africa.",
};

// The founder's own short description of each area, keyed to the program it describes.
const focusAreas = [
  { slug: "education-access", text: "Expanding educational opportunities for vulnerable and underserved children, including those who are out of school or at risk of dropping out." },
  { slug: "literacy-numeracy", text: "Strengthening foundational learning and supporting children's academic progress." },
  { slug: "digital-stem", text: "Preparing children and young people for an increasingly technology-driven world." },
  { slug: "youth-careers", text: "Equipping young people with practical skills, career guidance and opportunities for economic empowerment." },
  { slug: "community-families", text: "Strengthening the people and institutions that contribute to children's learning and development." },
  { slug: "infrastructure-welfare", text: "Promoting access to essential educational facilities, materials and supportive learning environments." },
  { slug: "agriculture-climate", text: "Encouraging practical knowledge, innovation and sustainable approaches to agriculture and environmental stewardship." },
  { slug: "research-partnerships", text: "Building evidence-based interventions and partnerships that advance educational equity and sustainable community development." },
];

type ChapterProps = { title: string; children: React.ReactNode };

// A chapter's heading holds its place beside the text on wide screens, so a long read keeps its bearings.
function Chapter({ title, children }: ChapterProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-16">
      <h2 className="text-3xl sm:text-4xl lg:sticky lg:top-28 lg:self-start">{title}</h2>
      <div className="prose">{children}</div>
    </div>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-2 border-accent pl-5 text-2xl leading-snug tracking-[-0.02em] sm:text-3xl">
      {children}
    </blockquote>
  );
}

export default function OurStoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our founder's story"
        title="A journey of resilience, a vision of opportunity"
        intro="Transforming personal adversity into a mission to expand educational opportunities and empower children and young people."
      />

      <Section id="journey">
        <Chapter title="The journey that inspired a mission">
          <p>
            Every meaningful mission has a story behind it. For EdBridge Africa, that story is rooted in personal
            experience, perseverance, compassion and an enduring belief that every child deserves an opportunity to
            learn, develop and build a better future.
          </p>
          <p>
            The inspiration behind EdBridge Africa comes from the founder&apos;s own childhood experiences and the
            challenges he encountered while pursuing an education. Growing up in a large family, he experienced
            significant hardship from an early age. The loss of his father at just six years old brought considerable
            difficulties to the family, making an already challenging childhood even more difficult.
          </p>
          <p>
            Financial constraints affected almost every aspect of his educational journey. Access to education, which
            should be a fundamental opportunity for every child, became a struggle shaped by poverty, limited resources
            and circumstances beyond his control.
          </p>
          <p>
            His educational journey was interrupted when financial hardship forced him to drop out of school at the
            middle-school level. This was a defining moment in his life. An opportunity that should have been readily
            available to him became uncertain, not because he lacked the ability or desire to learn, but because the
            resources needed to sustain his education were unavailable.
          </p>
          <p>
            For a child with aspirations and a desire to build a better future, being unable to continue school was a
            painful experience. Nevertheless, his determination to pursue an education remained.
          </p>
        </Chapter>
      </Section>

      <Section id="second-chance" tone="sand">
        <Chapter title="Overcoming barriers: a second chance at education">
          <p>
            Despite the setback, he remained determined to continue his education. Returning to school and pursuing
            further studies required perseverance, sacrifice and the ability to overcome circumstances that many
            children should never have to face.
          </p>
          <p>
            However, the challenges did not end with his return to education. During high school, he encountered
            another critical period when financial difficulties once again threatened to bring his educational journey
            to an end. The inability to afford school fees, uniforms, shoes and essential learning materials placed
            enormous pressure on his ability to remain in school.
          </p>
          <p>One particular experience remains an enduring reminder of the hardship he endured.</p>
          <PullQuote>
            <p>
              At a time when he could not afford a proper pair of shoes for school, he retrieved a discarded, broken
              shoe from a rubbish bin, repaired it and wore it to school.
            </p>
          </PullQuote>
          <p>
            What might appear to be an ordinary object to others represented, for him, an essential means of
            preserving his opportunity to learn. It was a difficult reality, but it demonstrated an extraordinary
            determination not to surrender his education simply because he lacked the basic necessities that others
            might take for granted.
          </p>
          <p>
            At another critical point during high school, the inability to meet school fees and obtain essential
            learning materials brought him close to dropping out once again. Fortunately, the intervention and support
            of someone who recognised the importance of his education helped him remain in school.
          </p>
          <p>
            His journey was further complicated by health challenges and other personal difficulties. Yet, through
            resilience, determination and the support he received, he continued pursuing his educational aspirations.
          </p>
          <p>
            These experiences left him with a profound understanding of the vulnerability of children whose
            educational opportunities depend on circumstances beyond their control. He came to appreciate that a
            child&apos;s inability to attend school or continue an education does not necessarily reflect a lack of
            intelligence, ambition or potential. Often, it reflects a lack of opportunity, resources and support.
          </p>
        </Chapter>
      </Section>

      <Section id="broader-purpose">
        <Chapter title="From personal experience to a broader purpose">
          <p>
            Years later, the founder encountered children within his own community who were experiencing
            circumstances remarkably similar to those he had faced during childhood.
          </p>
          <p>
            Some children were not attending school. Others had been out of school for extended periods, while many
            were at risk of dropping out because their families could not afford school fees, uniforms, shoes, books
            and other essential educational necessities.
          </p>
          <p>
            Seeing these children brought back memories of his own experiences. He recognised the struggles,
            uncertainty and barriers that could prevent a child from fulfilling their potential.
          </p>
          <p>
            He also became increasingly aware that educational exclusion extends beyond financial hardship. Children
            with disabilities may encounter additional challenges arising from inaccessible learning environments,
            inadequate educational support, discrimination and social exclusion. Young people in underserved
            communities may also have limited access to digital education, vocational training, career guidance and
            opportunities for personal and professional development.
          </p>
          <p>
            For him, these were not merely social issues or development statistics. They represented real lives,
            unrealised potential and futures that could be changed through timely intervention.
          </p>
          <p>
            He understood what it meant to want an education but lack the basic necessities to pursue one. He
            understood how difficult it could be to return to school after an interruption and how easily another
            financial setback could threaten the opportunity to continue.
          </p>
          <p>
            This realisation strengthened his conviction that no child should be left behind simply because of
            poverty, disability, geographical location or other disadvantaged circumstances. Rather than allowing his
            past experiences to remain personal memories, he chose to transform them into a commitment to creating
            opportunities for others.
          </p>
        </Chapter>
      </Section>

      <Section id="birth" tone="brand">
        <SceneSplit scene="bridge">
          <p className="text-label font-medium text-on-brand-muted">The birth of EdBridge Africa</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">EdBridge Africa emerged from this commitment.</h2>
          <div className="mt-6 max-w-2xl space-y-4 text-lg text-on-brand-muted">
            <p>
              What began as a desire to support vulnerable children in the community gradually developed into a broader
              vision of establishing an organisation dedicated to expanding educational access, promoting inclusion,
              supporting youth development and empowering underserved communities.
            </p>
            <p>
              The founder envisioned an organisation that would go beyond occasional assistance and short-term
              interventions: an institution capable of identifying vulnerable children and young people, understanding
              their individual circumstances, assessing their needs and connecting them with appropriate and
              sustainable support.
            </p>
            <p>
              A platform where children who had been out of school could receive support to return to education; where
              those at risk of dropping out could receive timely assistance; where children with disabilities could
              access inclusive educational opportunities; and where young people could acquire relevant knowledge,
              practical skills and confidence to pursue meaningful futures.
            </p>
          </div>
        </SceneSplit>
      </Section>

      <Section
        id="areas"
        title="Eight interconnected areas"
        intro="Education is not limited to formal classroom instruction. It encompasses the knowledge, skills, values, opportunities and capabilities that enable individuals to participate meaningfully in society and contribute to sustainable development. EdBridge Africa's commitment therefore extends across eight areas."
      >
        <ol className="grid gap-x-6 sm:grid-cols-2">
          {focusAreas.map(({ slug, text }) => {
            const program = getProgram(slug);
            if (!program) return null;
            return (
              <li key={slug} className="group relative flex gap-4 border-t border-line py-5">
                <span aria-hidden="true" className="w-7 shrink-0 pt-0.5 text-label font-medium tabular-nums text-muted">
                  {programNumber(programs.indexOf(program))}
                </span>
                <div>
                  <h3 className="text-lg">
                    <Link
                      href={programHref(program)}
                      className="inline-flex items-center gap-2 no-underline after:absolute after:inset-0 after:content-['']"
                    >
                      {program.title} <Arrow />
                    </Link>
                  </h3>
                  <p className="mt-1 text-base text-muted">{text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 max-w-3xl text-lg">
          Disability inclusion, accessibility, equality and the protection and well-being of children and young people
          are integral considerations across these areas.
        </p>
      </Section>

      <Section id="understanding" tone="sand">
        <Chapter title="A mission rooted in understanding, compassion and opportunity">
          <p>
            For the founder, EdBridge Africa represents more than the establishment of a nonprofit organisation. It
            represents a personal commitment shaped by lived experience and directed towards a greater social purpose.
          </p>
          <p>
            Having experienced educational interruption, financial hardship and the uncertainty of nearly losing an
            educational opportunity again, he understands the importance of timely assistance and meaningful support.
          </p>
          <p>
            He believes that no child should have to abandon an education because their family cannot afford school
            fees or basic learning materials. No child should be excluded because of a disability. No young person
            should be denied the opportunity to develop their abilities because of poverty or where they were born.
          </p>
          <PullQuote>
            <p>A child&apos;s circumstances should never determine the limits of their potential.</p>
          </PullQuote>
          <p>
            The founder&apos;s experiences have reinforced this central principle. EdBridge Africa seeks to translate
            it into practical action by identifying barriers, supporting individual needs, strengthening communities
            and creating pathways through which children and young people can access opportunities to learn, grow and
            succeed.
          </p>
        </Chapter>
      </Section>

      <Section id="vision-for-africa" title="Looking beyond today: a vision for Africa">
        <SceneSplit scene="converge" side="left">
          <div className="prose">
            <p>
              Although its founding inspiration is rooted in personal and community experiences in Ghana, EdBridge
              Africa aspires to contribute to a broader African development agenda.
            </p>
            <p>
              The organisation envisions an Africa where every child has access to quality, inclusive and equitable
              education; where young people are equipped with relevant knowledge and skills; where persons with
              disabilities participate meaningfully in educational and community life; and where communities are
              empowered to create sustainable opportunities for future generations.
            </p>
            <p>
              Educational transformation requires collective responsibility. Governments, educational institutions,
              civil society organisations, development partners, businesses, families and communities all have
              important roles to play. EdBridge Africa therefore seeks to build meaningful partnerships with local and
              international stakeholders who share its commitment to education, inclusion, child and youth
              development, innovation and sustainable community empowerment.
            </p>
            <p>
              Through collaboration, responsible leadership, community engagement and evidence-informed programs, the
              organisation aims to contribute to lasting improvements in the lives of children, young people and
              underserved communities.
            </p>
          </div>
        </SceneSplit>
      </Section>

      <Section id="lasting-impact" tone="brand">
        <div className="max-w-4xl">
          <p className="text-label font-medium text-on-brand-muted">
            A personal journey. A collective responsibility. A lasting impact.
          </p>
          <div className="mt-6 max-w-2xl space-y-4 text-lg text-on-brand-muted">
            <p>
              The story of EdBridge Africa is a reminder that personal adversity can become a source of purpose, and
              that the opportunity one person once struggled to obtain can inspire a commitment to creating
              opportunities for many others.
            </p>
            <p>
              Dropping out of school, returning to education, nearly losing that opportunity again and having to repair
              a discarded shoe just to attend high school are not simply memories of hardship. They are part of the
              foundation upon which EdBridge Africa&apos;s purpose was built.
            </p>
            <p>
              The founder believes that every child deserves the opportunity to discover their abilities, every young
              person deserves the support to develop their potential, and every community deserves the opportunity to
              build a better future for its next generation. EdBridge Africa exists to help turn these beliefs into
              reality.
            </p>
          </div>
          <h2 className="mt-10 text-3xl sm:text-4xl lg:text-5xl">
            Because no child should be left behind when a bridge can be built to help them move forward.
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/donate">Donate</ButtonLink>
            <ButtonLink href="/get-involved" variant="secondary" className="text-on-brand">
              Get involved
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}

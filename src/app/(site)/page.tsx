import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { KenteScene } from "@/components/kente-scene/kente-scene";
import { LinkCard } from "@/components/link-card";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";
import { WovenBand, WovenPanel } from "@/components/woven";
import { programHref, programNumber, programs } from "@/content/programs";

const commitments = [
  {
    title: "Access",
    text: "We remove the costs and barriers that keep children out of the classroom — fees, uniforms, books, transport and more.",
  },
  {
    title: "Inclusion",
    text: "We design every program so children and young people with disabilities can take part fully, not as an afterthought.",
  },
  {
    title: "Protection",
    text: "We keep children safe at every step, with consent, care and clear accountability to the families we serve.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="bg-sand" data-enter>
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <p className="text-label font-medium text-muted">
              Education · Inclusion · Empowerment · Opportunity
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-[4rem]">
              A future where every child can learn, thrive and succeed.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-muted">
              EdBridge Africa bridges educational inequalities for vulnerable and underserved children and young people
              in Ghana — especially those out of school, at risk of dropping out, or living with a disability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/donate">
                Donate
              </ButtonLink>
              <ButtonLink href="/get-involved" variant="secondary">
                Get involved
              </ButtonLink>
            </div>
            <p className="mt-6 text-base">
              Need support for a child?{" "}
              <Link href="/apply" className="link font-medium">
                Apply for support
              </Link>
            </p>
          </div>
          <KenteScene scene="cloth" className="mx-auto aspect-square w-full max-w-sm sm:max-w-md lg:aspect-[4/5] lg:max-w-none">
            <WovenPanel id="hero-weave" className="size-full" />
          </KenteScene>
        </Container>
        <WovenBand id="hero-band" />
      </div>

      <Section id="commitments" title="What we stand for">
        <ul className="grid gap-6 md:grid-cols-3">
          {commitments.map(({ title, text }) => (
            <li key={title} className="border-line sm:border-t sm:pt-6">
              <h3 className="text-xl">{title}</h3>
              <p className="mt-2 text-base text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="programs"
        tone="sand"
        title="Our programs"
        intro="Eight interconnected areas of focus, from the first day of school to the first job — with disability inclusion and child protection running through every one."
      >
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program, index) => (
            <li key={program.slug}>
              <LinkCard
                swatch={index}
                label={programNumber(index)}
                href={programHref(program)}
                title={program.title}
                description={program.summary}
              />
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/programs" className="link inline-flex items-center gap-2 font-medium">
            See all programs and activities <Arrow />
          </Link>
        </p>
      </Section>

      <Section id="inclusion" tone="brand">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl">Inclusion is how we work, not a side project</h2>
            <p className="mt-4 max-w-2xl text-lg text-on-brand-muted">
              Children with disabilities are among the most likely to be out of school. We arrange accommodations,
              assistive technology, accessible materials and Ghanaian Sign Language interpretation so every child can
              learn and take part.
            </p>
            <ButtonLink href="/disability-inclusion" variant="secondary" className="mt-6 text-on-brand">
              Our approach to inclusion
            </ButtonLink>
          </div>
          {/* Scrubbed by scroll: every strip unrolls into the cloth as the band rises, one thread woven in. */}
          <KenteScene
            scene="cloth"
            mode="scroll"
            strips={5}
            length={3}
            shift={1}
            className="mx-auto aspect-square w-full max-w-xs sm:max-w-sm lg:max-w-none"
          >
            <WovenPanel id="inclusion-weave" className="size-full" />
          </KenteScene>
        </div>
      </Section>

      <Section id="our-story" tone="sand">
        <SceneSplit scene="stairs" count={4} side="left">
          <p className="text-label font-medium text-muted">Our founder&apos;s story</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">Built by someone who nearly lost his education</h2>
          <blockquote className="mt-6 max-w-2xl border-l-2 border-accent pl-5 text-xl">
            <p>
              At a time when he could not afford a proper pair of shoes for school, he retrieved a discarded, broken shoe
              from a rubbish bin, repaired it and wore it to school.
            </p>
          </blockquote>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Our founder lost his father at six, dropped out of middle school when his family could not afford it, and
            nearly dropped out again in high school. EdBridge Africa exists so other children don&apos;t have to.
          </p>
          <p className="mt-6">
            <Link href="/our-story" className="link inline-flex items-center gap-2 font-medium">
              Read our founder&apos;s story <Arrow />
            </Link>
          </p>
        </SceneSplit>
      </Section>

      <Section id="sponsor" title="Sponsor a child's education">
        <SceneSplit scene="fan">
          <div className="space-y-4">
            <p className="max-w-2xl text-lg">
              Your gift can cover school fees, uniforms and shoes, books and stationery, transport, meals, tutoring or
              an assistive device — the things that decide whether a child stays in school.
            </p>
            <p className="max-w-2xl text-base text-muted">
              Every gift is recorded, approved and reported so you can see where your support goes.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/donate">Donate now</ButtonLink>
            <ButtonLink href="/donate#sponsor" variant="secondary">
              How sponsorship works
            </ButtonLink>
          </div>
        </SceneSplit>
      </Section>

      <Section
        id="get-involved"
        tone="sand"
        title="Join us in bridging the gap"
        intro="Together, we can build a future where no child is left behind. Every contribution, partnership, volunteer effort and act of support can help open doors to education and opportunity."
      >
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <LinkCard
              href="/donate"
              title="Donate"
              swatch={0}
              description="Support educational access and development programs."
              cta="Give today"
            />
          </li>
          <li>
            <LinkCard
              href="/volunteer"
              title="Volunteer"
              swatch={1}
              description="Share your time, knowledge and skills."
              cta="Volunteer with us"
            />
          </li>
          <li>
            <LinkCard
              href="/partnerships"
              title="Partner with us"
              swatch={2}
              description="Collaborate on sustainable educational and community initiatives."
              cta="Explore partnerships"
            />
          </li>
          <li>
            <LinkCard
              href="/donate#sponsor"
              title="Sponsor a child"
              swatch={3}
              description="Help a vulnerable child access and continue their education."
              cta="Become a sponsor"
            />
          </li>
        </ul>
      </Section>
    </>
  );
}

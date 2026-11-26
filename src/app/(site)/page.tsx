import Link from "next/link";
import { getNews } from "@/cms/queries";
import { Arrow } from "@/components/arrow";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { KenteScene } from "@/components/kente-scene/kente-scene";
import { LinkCard } from "@/components/link-card";
import { NewsList } from "@/components/news-list";
import { Section } from "@/components/section";
import { SceneSplit } from "@/components/scene-split";
import { Tag } from "@/components/tag";
import { WovenBand, WovenPanel } from "@/components/woven";
import { programHref, programNumber, programs } from "@/content/programs";
import { stories, storyHref } from "@/content/stories";

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

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link inline-flex items-center gap-2 font-medium">
      {children} <Arrow />
    </Link>
  );
}

export default async function HomePage() {
  const latest = (await getNews()).slice(0, 3);

  return (
    <>
      <div className="bg-sand" data-enter>
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <p className="text-label font-medium text-muted">
              Education · Disability Inclusion · Empowerment · Opportunity
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-[3.5rem]">
              A future where every child and young person, including those with disabilities, can learn, thrive and
              succeed.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-muted">
              EdBridge Africa is committed to bridging educational gaps and creating inclusive opportunities for
              vulnerable children and young people across Ghana. We believe that every individual, regardless of
              disability, background, financial circumstances or personal challenges, deserves equal access to quality
              education, opportunities for growth and the chance to reach their full potential.
            </p>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Through inclusive education, accessibility, empowerment and community development, we are working towards
              a future where no child or young person is excluded, overlooked or left behind.
            </p>
            <p className="mt-5 max-w-xl text-xl font-medium">
              Every ability deserves an opportunity. Every child deserves a future.
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

      <Section id="mission">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-label font-medium text-muted">Our mission</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">Bridging the gap between children and opportunity.</h2>
          </div>
          <div>
            <p className="text-xl">
              EdBridge Africa is committed to breaking financial, social and educational barriers that prevent
              vulnerable and underserved children and young people in Ghana from accessing quality education and
              achieving their full potential.
            </p>
            <p className="mt-4 text-lg text-muted">
              We create opportunities through educational support, access to essential learning resources, mentorship,
              digital skills development, vocational training, personal development and inclusive community
              initiatives — so that children and young people who face educational disadvantages are not left behind,
              but receive the support, encouragement, resources and opportunities they need to thrive and succeed.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <TextLink href="/about">About EdBridge Africa</TextLink>
              <TextLink href="/mission">Mission, vision and values</TextLink>
            </p>
          </div>
        </div>

        <h3 className="mt-14 text-label font-medium text-muted sm:mt-20">What we stand for</h3>
        <ul className="mt-4 grid gap-6 md:grid-cols-3">
          {commitments.map(({ title, text }) => (
            <li key={title} className="border-line sm:border-t sm:pt-6">
              <h4 className="text-xl">{title}</h4>
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
          <TextLink href="/programs">See all programs and activities</TextLink>
        </p>
      </Section>

      <Section id="activities" title="Our activities" intro="Children starting and returning to school with our support.">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <article
            aria-labelledby="initiative-title"
            className="flex flex-col items-start rounded-2xl border border-line bg-sand p-6 sm:p-8"
          >
            <Tag>Ongoing initiative</Tag>
            <h3 id="initiative-title" className="mt-4 text-2xl sm:text-3xl">
              Education Access and Inclusion Initiative
            </h3>
            <p className="mt-3 text-lg text-muted">
              We remove the financial and material barriers that keep children out of the classroom, from school fees
              and PTA levies to uniforms, shoes, books and stationery.
            </p>
            <p className="mt-6">
              <TextLink href="/campaigns">Campaigns and initiatives</TextLink>
            </p>
            <WovenPanel id="activities-weave" className="mt-8 min-h-24 w-full flex-1 rounded-lg" />
          </article>
          <ul className="divide-y divide-line border-y border-line">
            {stories.map((story) => (
              <li key={story.slug} className="group relative py-5">
                <p className="text-label font-medium text-muted">{story.name}&apos;s story</p>
                <h3 className="mt-1 text-xl">
                  <Link href={storyHref(story.slug)} className="no-underline after:absolute after:inset-0 after:content-['']">
                    {story.title}
                  </Link>
                </h3>
                <p className="mt-1 text-base text-muted">{story.summary}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <TextLink href="/gallery">Photo gallery</TextLink>
          <TextLink href="/impact">Projects and impact</TextLink>
        </p>
      </Section>

      {latest.length > 0 && (
        <Section id="latest" tone="sand" title="Latest news, events and publications">
          <NewsList items={latest} />
          <p className="mt-8">
            <TextLink href="/news">See all news, events and publications</TextLink>
          </p>
        </Section>
      )}

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
            Our founder lost his father at six, dropped out of Junior High School when his family could not afford it, and
            nearly dropped out again in high school. EdBridge Africa exists so other children don&apos;t have to.
          </p>
          <p className="mt-6">
            <TextLink href="/our-story">Read our founder&apos;s story</TextLink>
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

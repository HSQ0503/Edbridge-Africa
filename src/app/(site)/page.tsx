import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { LinkCard } from "@/components/link-card";
import { Section } from "@/components/section";
import { WovenBand, WovenPanel } from "@/components/woven";
import { programHref, programs } from "@/content/programs";

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
              Education access · Disability inclusion · Youth development
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-[4rem]">
              Every child in school, learning, and included.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-muted">
              EdBridge Africa helps children and young people in Ghana get into school, stay in school and thrive —
              especially those most often left behind, including children with disabilities.
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
          {/* Client slot: a consented, strength-based photograph replaces this panel when EdBridge has one (PLAN.md, photography). */}
          <WovenPanel id="hero-weave" className="mx-auto aspect-square w-full max-w-md" />
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
        intro="From the first day of school to the first job, our programs support children and young people at every stage."
      >
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <li key={program.slug}>
              <LinkCard
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
        <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl">Inclusion is how we work, not a side project</h2>
            <p className="mt-4 max-w-2xl text-lg text-on-brand-muted">
              Children with disabilities are among the most likely to be out of school. We arrange accommodations,
              assistive technology, accessible materials and Ghanaian Sign Language interpretation so every child can
              learn and take part.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/disability-inclusion" variant="secondary" className="text-on-brand">
              Our approach to inclusion
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section id="sponsor" title="Sponsor a child's education">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <p className="max-w-2xl text-lg">
              Your gift can cover school fees, uniforms and shoes, books and stationery, transport, meals, tutoring or
              an assistive device — the things that decide whether a child stays in school.
            </p>
            <p className="max-w-2xl text-base text-muted">
              Every gift is recorded, approved and reported so you can see where your support goes.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3 lg:justify-end">
            <ButtonLink href="/donate">
              Donate now
            </ButtonLink>
            <ButtonLink href="/donate#sponsor" variant="secondary">
              How sponsorship works
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section id="get-involved" tone="sand" title="Get involved">
        <ul className="grid gap-6 md:grid-cols-3">
          <li>
            <LinkCard
              href="/volunteer"
              title="Volunteer"
              description="Tutor, mentor, share professional skills or support community outreach."
              cta="Volunteer with us"
            />
          </li>
          <li>
            <LinkCard
              href="/partnerships"
              title="Partner with us"
              description="Companies, foundations and institutions can fund programs, give in kind or share expertise."
              cta="Explore partnerships"
            />
          </li>
          <li>
            <LinkCard
              href="/careers"
              title="Work with us"
              description="Join a team working to widen access to education across Ghana."
              cta="See careers"
            />
          </li>
        </ul>
      </Section>
    </>
  );
}

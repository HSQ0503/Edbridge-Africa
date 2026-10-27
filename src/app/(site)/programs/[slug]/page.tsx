import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PageHeader } from "@/components/page-header";
import { ProgramIcon } from "@/components/program-icon";
import { Section } from "@/components/section";
import { getProgram, programs } from "@/content/programs";

export function generateStaticParams() {
  return programs.filter((program) => !program.href).map((program) => ({ slug: program.slug }));
}

// Programs with their own page (e.g. disability inclusion) must not be reachable twice.
function findProgram(slug: string) {
  const program = getProgram(slug);
  return program && !program.href ? program : undefined;
}

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const program = findProgram((await params).slug);
  return program ? { title: program.title, description: program.summary } : {};
}

// Suspense lets navigation show the shell instantly; prerendered slugs still ship full HTML.
export default function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-72 bg-sand" />}>
      <ProgramContent params={params} />
    </Suspense>
  );
}

async function ProgramContent({ params }: Pick<PageProps<"/programs/[slug]">, "params">) {
  const program = findProgram((await params).slug);
  if (!program) notFound();

  return (
    <>
      <PageHeader eyebrow="Our programs" title={program.title} intro={program.summary} />

      <Section id="overview">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <p className="max-w-[70ch] text-lg">{program.intro}</p>
            <div>
              <h2 className="text-2xl font-bold">What we do</h2>
              <ul className="mt-4 space-y-3">
                {program.activities.map((activity) => (
                  <li key={activity} className="flex gap-3">
                    <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside aria-labelledby="who-we-support" className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-6">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
              <ProgramIcon name={program.icon} />
            </span>
            <h2 id="who-we-support" className="text-xl font-bold">
              Who we support
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-base">
              {program.whoWeSupport.map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section id="take-part" tone="sand" title="Get support or help others">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/apply">Apply for support</ButtonLink>
          <ButtonLink href="/donate" variant="donate">
            Donate
          </ButtonLink>
          <ButtonLink href="/volunteer" variant="secondary">
            Volunteer
          </ButtonLink>
        </div>
        <p className="mt-8">
          <Link href="/programs" className="inline-flex items-center gap-1 font-semibold text-brand underline">
            <ArrowLeft aria-hidden="true" className="size-4" /> All programs
          </Link>
        </p>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn, FolderOpen, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Projects and impact",
  description: "EdBridge Africa's projects, how we measure impact and what changes for children and young people.",
};

const measurement = [
  {
    title: "Clear indicators",
    text: "Each project sets targets — enrolment, attendance, retention, learning progress, skills gained — and tracks them over time.",
  },
  {
    title: "Checked data",
    text: "Our monitoring and evaluation team verifies data before it is reported, so the numbers we publish are ones we can stand behind.",
  },
  {
    title: "Listening to families",
    text: "Children, young people and caregivers can give feedback at any time, and we act on what we hear.",
  },
  {
    title: "Privacy first",
    text: "We publish totals, never personal details. Very small numbers are hidden so no child can be identified.",
  },
];

export default function ImpactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Projects and impact"
        intro="What we do, where we do it, and what changes for the children and young people we work with."
      />

      <Section id="projects" title="Our projects">
        <EmptyState icon={<FolderOpen className="size-6" />} title="Project profiles are on their way">
          <p>
            Each project will have its own page showing its goals, the communities it serves, its funders and its
            results. You will be able to filter projects by program, region and status.
          </p>
        </EmptyState>
      </Section>

      <Section id="measuring-impact" tone="sand" title="How we measure impact">
        <ul className="grid gap-6 md:grid-cols-2">
          {measurement.map((item) => (
            <li key={item.title} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-base text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="results" title="Results and stories">
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState icon={<ChartColumn className="size-6" />} title="Impact figures">
            <p>Verified figures on children supported, enrolment and retention will be published here.</p>
          </EmptyState>
          <EmptyState icon={<MessageCircle className="size-6" />} title="Stories of change">
            <p>
              Stories are shared only with consent from the child and their family, using first names or pseudonyms and
              never revealing where a child lives or goes to school.
            </p>
          </EmptyState>
        </div>
        <p className="mt-8 max-w-2xl">
          Looking for reports? Annual reports and evaluations will be listed on our{" "}
          <Link href="/news#publications" className="font-semibold text-brand underline">
            publications
          </Link>{" "}
          page.
        </p>
      </Section>
    </>
  );
}

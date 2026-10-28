import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { getLeaders, type Leader } from "@/cms/queries";
import { CmsImage } from "@/components/cms-image";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

const boardResponsibilities = [
  "Setting strategic direction and approving organisational policies",
  "Overseeing finances, approving budgets and reviewing audited accounts",
  "Reviewing organisational performance and program outcomes",
  "Ensuring accountability, safeguarding and compliance with Ghanaian law",
];

export const metadata: Metadata = {
  title: "Board of Directors and leadership",
  description: "The Board of Directors and leadership team who govern and lead EdBridge Africa.",
};

function LeaderList({ leaders }: { leaders: Leader[] }) {
  if (!leaders.length) {
    return (
      <EmptyState icon={<UserRound className="size-6" />} title="Profiles coming soon">
        <p>Names, photographs and short biographies will be added here.</p>
      </EmptyState>
    );
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {leaders.map((leader) => (
        <li key={leader.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
          {leader.photo ? (
            <CmsImage image={leader.photo} sizes="4rem" className="size-16 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
            >
              <UserRound className="size-8" />
            </span>
          )}
          <div>
            <h3 className="text-lg font-bold">{leader.name ?? <span className="text-muted">Name to be confirmed</span>}</h3>
            <p className="text-base font-semibold text-accent-text">{leader.role}</p>
            {leader.bio && <p className="mt-2 text-base text-muted">{leader.bio}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function LeadershipPage() {
  const { board, executive } = await getLeaders();
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Board of Directors and leadership"
        intro="EdBridge Africa is governed by an independent Board of Directors and led day to day by the Executive Director and leadership team."
      />

      <Section id="board" title="Board of Directors">
        <LeaderList leaders={board} />
      </Section>

      <Section id="board-role" tone="sand" title="What the board does">
        <ul className="prose list-disc">
          {boardResponsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="leadership-team" title="Leadership team">
        <LeaderList leaders={executive} />
      </Section>
    </>
  );
}

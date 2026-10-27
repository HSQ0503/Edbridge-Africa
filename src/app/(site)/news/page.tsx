import type { Metadata } from "next";
import { CalendarDays, FileText, Newspaper } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "News, events and publications",
  description: "The latest news, upcoming events, reports and publications from EdBridge Africa.",
};

export default function NewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="News"
        title="News, events and publications"
        intro="Updates from our programs, upcoming events, and our reports and publications."
      >
        <nav aria-label="On this page">
          <ul className="flex flex-wrap gap-3">
            {[
              { href: "#news", label: "News" },
              { href: "#events", label: "Events" },
              { href: "#publications", label: "Publications" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 font-semibold text-ink no-underline hover:bg-ink/5"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section id="news" title="News">
        <EmptyState icon={<Newspaper className="size-6" />} title="No news yet">
          <p>Stories and updates from our programs will appear here.</p>
        </EmptyState>
      </Section>

      <Section id="events" tone="sand" title="Events">
        <EmptyState icon={<CalendarDays className="size-6" />} title="No upcoming events">
          <p>Each event will list its date, location, accessibility information and how to register.</p>
        </EmptyState>
      </Section>

      <Section id="publications" title="Publications">
        <EmptyState icon={<FileText className="size-6" />} title="No publications yet">
          <p>
            Annual reports, evaluations and policy briefs will be published here as web pages, with accessible PDF
            downloads.
          </p>
        </EmptyState>
      </Section>
    </>
  );
}

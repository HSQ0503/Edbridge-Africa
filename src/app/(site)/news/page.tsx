import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileText, Newspaper } from "lucide-react";
import { getNews, type NewsItem } from "@/cms/queries";
import { CmsImage } from "@/components/cms-image";
import { FormattedDate } from "@/components/date";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "News, events and publications",
  description: "The latest news, upcoming events, reports and publications from EdBridge Africa.",
};

function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {item.image && (
            <CmsImage image={item.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-video w-full object-cover" />
          )}
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="text-sm font-semibold text-accent-text">
              <FormattedDate value={item.date} />
              {item.type === "event" && item.event?.venue && ` · ${item.event.venue}`}
            </p>
            <h3 className="text-xl font-bold">
              <Link href={`/news/${item.slug}`} className="text-ink no-underline hover:underline">
                {item.title}
              </Link>
            </h3>
            <p className="text-base text-muted">{item.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function NewsPage() {
  const items = await getNews();
  const news = items.filter((item) => item.type === "news");
  const events = items.filter((item) => item.type === "event").reverse();
  const publications = items.filter((item) => item.type === "publication");

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
        {news.length ? (
          <NewsList items={news} />
        ) : (
          <EmptyState icon={<Newspaper className="size-6" />} title="No news yet">
            <p>Stories and updates from our programs will appear here.</p>
          </EmptyState>
        )}
      </Section>

      <Section id="events" tone="sand" title="Events">
        {events.length ? (
          <NewsList items={events} />
        ) : (
          <EmptyState icon={<CalendarDays className="size-6" />} title="No upcoming events">
            <p>Each event will list its date, location, accessibility information and how to register.</p>
          </EmptyState>
        )}
      </Section>

      <Section id="publications" title="Publications">
        {publications.length ? (
          <NewsList items={publications} />
        ) : (
          <EmptyState icon={<FileText className="size-6" />} title="No publications yet">
            <p>Annual reports, evaluations and policy briefs will be published here as web pages.</p>
          </EmptyState>
        )}
      </Section>
    </>
  );
}

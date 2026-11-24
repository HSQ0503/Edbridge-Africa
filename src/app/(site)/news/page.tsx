import type { Metadata } from "next";
import { getNews } from "@/cms/queries";
import { EmptyState } from "@/components/empty-state";
import { NewsList } from "@/components/news-list";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "News, Events & Publications",
  description: "The latest news, upcoming events, reports and publications from EdBridge Africa.",
};

export default async function NewsPage() {
  const items = await getNews();
  const news = items.filter((item) => item.type === "news");
  const events = items.filter((item) => item.type === "event").reverse();
  const publications = items.filter((item) => item.type === "publication");

  return (
    <>
      <PageHeader
        title="News, Events & Publications"
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
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 font-medium text-ink no-underline hover:bg-ink/5"
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
          <EmptyState title="No news yet">
            <p>Stories and updates from our programs will appear here.</p>
          </EmptyState>
        )}
      </Section>

      <Section id="events" tone="sand" title="Events">
        {events.length ? (
          <NewsList items={events} />
        ) : (
          <EmptyState title="No upcoming events">
            <p>Each event will list its date, location, accessibility information and how to register.</p>
          </EmptyState>
        )}
      </Section>

      <Section id="publications" title="Publications">
        {publications.length ? (
          <NewsList items={publications} />
        ) : (
          <EmptyState title="No publications yet">
            <p>Annual reports, evaluations and policy briefs will be published here as web pages.</p>
          </EmptyState>
        )}
      </Section>
    </>
  );
}

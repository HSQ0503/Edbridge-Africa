import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNews, getNewsItem } from "@/cms/queries";
import { CmsImage } from "@/components/cms-image";
import { Container } from "@/components/container";
import { FormattedDate } from "@/components/date";
import { RichText } from "@/components/rich-text";

// Cache Components needs at least one param; the placeholder renders as not found.
const NO_ITEMS = "__none__";

export async function generateStaticParams() {
  const items = await getNews();
  return items.length ? items.map((item) => ({ slug: item.slug })) : [{ slug: NO_ITEMS }];
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const item = await getNewsItem((await params).slug);
  return item ? { title: item.title, description: item.summary } : {};
}

const typeLabels = { news: "News", event: "Event", publication: "Publication" } as const;

async function NewsArticle({ params }: Pick<PageProps<"/news/[slug]">, "params">) {
  const item = await getNewsItem((await params).slug);
  if (!item) notFound();

  return (
    <article>
      <header className="bg-sand py-12 sm:py-16">
        <Container className="max-w-3xl space-y-4">
          <p>
            <Link href="/news" className="inline-flex items-center gap-1 font-semibold text-brand underline">
              <ArrowLeft aria-hidden="true" className="size-4" /> News, events and publications
            </Link>
          </p>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">
            {typeLabels[item.type]} · <FormattedDate value={item.date} />
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">{item.title}</h1>
          <p className="text-lg text-muted">{item.summary}</p>
        </Container>
      </header>
      <Container className="max-w-3xl space-y-8 py-12">
        {item.image && <CmsImage image={item.image} sizes="(min-width: 768px) 768px, 100vw" className="w-full rounded-2xl" />}
        {item.type === "event" && (item.event?.venue || item.event?.accessibility) && (
          <dl className="space-y-3 rounded-2xl border border-line bg-surface p-5">
            {item.event.venue && (
              <div>
                <dt className="font-semibold">Venue</dt>
                <dd>{item.event.venue}</dd>
              </div>
            )}
            {item.event.accessibility && (
              <div>
                <dt className="font-semibold">Accessibility</dt>
                <dd className="whitespace-pre-line">{item.event.accessibility}</dd>
              </div>
            )}
          </dl>
        )}
        <RichText data={item.body} />
      </Container>
    </article>
  );
}

export default function NewsArticlePage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-72 bg-sand" />}>
      <NewsArticle params={params} />
    </Suspense>
  );
}

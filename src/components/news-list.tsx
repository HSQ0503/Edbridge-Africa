import Link from "next/link";
import type { NewsItem } from "@/cms/queries";
import { CmsImage } from "./cms-image";
import { FormattedDate } from "./date";

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {item.image && (
            <CmsImage image={item.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-video w-full object-cover" />
          )}
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="text-label font-medium text-muted">
              <FormattedDate value={item.date} />
              {item.type === "event" && item.event?.venue && ` · ${item.event.venue}`}
            </p>
            <h3 className="text-xl">
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

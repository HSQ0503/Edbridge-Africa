import Link from "next/link";
import { Arrow } from "./arrow";

export function LinkCard({
  href,
  title,
  description,
  cta = "Learn more",
}: {
  href: string;
  title: string;
  description: string;
  cta?: string;
}) {
  return (
    <div className="group relative flex h-full flex-col border-line sm:border-t sm:pt-6 transition-[border-color,translate] duration-150 ease-[var(--ease)] hover:border-ink motion-safe:hover:-translate-y-0.5">
      <h3 className="text-xl">
        {/* The pseudo-element stretches the link over the card so the whole card is clickable. */}
        <Link href={href} className="no-underline after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-base text-muted">{description}</p>
      <span aria-hidden="true" className="mt-5 inline-flex items-center gap-2 text-base font-medium text-brand">
        {cta}
        <Arrow />
      </span>
    </div>
  );
}

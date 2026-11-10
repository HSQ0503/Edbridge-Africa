import Link from "next/link";
import { Arrow } from "./arrow";
import { KenteFold } from "./kente-fold";

export function LinkCard({
  href,
  title,
  description,
  cta = "Learn more",
  swatch = 0,
}: {
  href: string;
  title: string;
  description: string;
  cta?: string;
  swatch?: number;
}) {
  return (
    <div className="group relative flex h-full flex-col transition-[translate] duration-150 ease-[var(--ease)] motion-safe:hover:-translate-y-0.5">
      <KenteFold shift={swatch} className="mb-6" />
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

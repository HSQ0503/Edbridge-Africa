import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LinkCard({
  href,
  title,
  description,
  icon,
  cta = "Learn more",
}: {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  cta?: string;
}) {
  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-brand">
      {icon && (
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
          {icon}
        </span>
      )}
      <h3 className={`text-xl font-bold ${icon ? "mt-4" : ""}`}>
        {/* The pseudo-element stretches the link over the card so the whole card is clickable. */}
        <Link href={href} className="rounded no-underline after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-base text-muted">{description}</p>
      <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-brand">
        {cta}
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}

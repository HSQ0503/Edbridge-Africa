import Link from "next/link";
import { site } from "@/content/site";

// Placeholder mark until EdBridge supplies brand assets (PLAN.md §19).
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={className}>
      <rect width="40" height="40" rx="10" className="fill-brand" />
      <path d="M8 27 Q20 9 32 27" fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-accent" />
      <rect x="6" y="26" width="28" height="3.5" rx="1.75" className="fill-on-brand" />
      <rect x="18.5" y="16" width="3" height="10" className="fill-accent" />
    </svg>
  );
}

export function Logo() {
  const [firstWord, ...rest] = site.name.split(" ");
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-lg font-serif font-bold text-ink no-underline sm:gap-3"
    >
      <LogoMark className="size-9 shrink-0 sm:size-10" />
      {/* Stacks on phones so the name, Donate and Menu all fit on a 360px screen. */}
      <span className="flex flex-col text-base leading-tight max-[359px]:sr-only sm:flex-row sm:gap-1.5 sm:text-xl">
        <span>{firstWord}</span> <span>{rest.join(" ")}</span>
      </span>
    </Link>
  );
}

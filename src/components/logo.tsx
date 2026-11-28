import { useId } from "react";
import Link from "next/link";
import { site } from "@/content/site";

// EdBridge's mark (bridge on an open book), traced from the vector logo they sent on 27 November 2026.
// The paths keep the PDF's own coordinates, so the group flips them the right way up.
const ARCH =
  "M41.43 90.19 41.48 78.7 43.73 77.27 45.99 78.7V90.28C51.57 88.57 54.34 86.5 60.1 79.34L66.19 77.22C55.34 103.83 29.49 98.68 19.97 77.42L27.32 79.11C32.48 86.66 36.32 89.09 41.43 90.19Z";
const UPPER_PAGE =
  "M66.56 76.95C58.84 79.46 51.21 78.07 43.74 71.88 34.98 77.84 26.98 79.13 19.46 77.12 27.26 81.86 35.27 81.72 43.74 76.15 53.29 82.25 60.6 81.39 66.56 76.95Z";
const LOWER_PAGE =
  "M43.73 70.65C35.71 76.58 27.26 78.67 18.87 75.3L17.58 71.76C26.72 76.34 35.37 74.1 43.78 68.63 52.35 74.57 60.52 75.87 68.23 72.12L66.95 75.62C58.75 77.98 51.19 76.5 43.73 70.65Z";

export function LogoMark({ className = "size-10", outlined = false }: { className?: string; outlined?: boolean }) {
  const gradientId = `logo-green-${useId().replace(/[^\w-]/g, "")}`;
  // Square box around the slightly wide mark; a little wider when outlined so the hairline isn't clipped.
  const viewBox = outlined ? "15.22 32.76 54.87 54.87" : "16.02 33.56 53.27 53.27";
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.27" stopColor="#038620" />
          <stop offset="0.82" stopColor="#024805" />
        </linearGradient>
      </defs>
      <rect
        x="16.02"
        y="35.51"
        width="53.27"
        height="49.38"
        rx="12.94"
        fill={`url(#${gradientId})`}
        {...(outlined && { stroke: "currentColor", strokeOpacity: 0.35, strokeWidth: 1.2 })}
      />
      <g transform="matrix(1 0 0 -1 0 144)" fillRule="evenodd">
        <path d={ARCH} fill="#fccb02" />
        <path d={UPPER_PAGE} fill="#fffefa" />
        <path d={LOWER_PAGE} fill="#fffefa" />
      </g>
    </svg>
  );
}

export function Logo() {
  const [firstWord, ...rest] = site.name.split(" ");
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-lg font-logo font-bold text-ink no-underline sm:gap-3"
    >
      <LogoMark className="size-9 shrink-0 sm:size-10" />
      {/* Stacks on phones so the name, Donate and Menu all fit on a 360px screen. */}
      <span className="flex flex-col text-base leading-tight max-[359px]:sr-only sm:flex-row sm:gap-1.5 sm:text-xl">
        <span>{firstWord}</span> <span>{rest.join(" ")}</span>
      </span>
    </Link>
  );
}

import Link from "next/link";
import { Arrow } from "./arrow";

// One filled button marks the action; the second action is a text link at the button's height.
type ButtonVariant = "primary" | "secondary";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg py-2.5 text-base font-medium transition-[background-color,color,text-decoration-color,translate,scale] duration-150 ease-[var(--ease)] active:scale-[.985]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-cta text-on-cta no-underline hover:bg-cta-strong motion-safe:hover:-translate-y-px active:translate-y-px",
  secondary:
    "text-current underline decoration-current/35 decoration-1 underline-offset-[6px] hover:decoration-current",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "", compact = false) {
  const padding = variant === "secondary" ? "px-0" : compact ? "px-3 sm:px-5" : "px-5";
  return `${base} ${padding} ${variants[variant]} ${className}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  compact,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = buttonClass(variant, className, compact);
  // The header's compact button stays a plain label so it fits beside the menu on a 360px phone.
  const content = (
    <>
      {children}
      {!compact && <Arrow />}
    </>
  );
  if (href.startsWith("http")) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

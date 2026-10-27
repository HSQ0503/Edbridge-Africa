import Link from "next/link";

type ButtonVariant = "primary" | "donate" | "secondary" | "onBrand";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-strong",
  donate: "bg-cta text-on-cta hover:bg-cta-strong",
  secondary: "border-2 border-ink text-ink hover:bg-ink/5",
  onBrand: "bg-on-brand text-brand hover:bg-brand-tint",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "", compact = false) {
  const padding = compact ? "px-3 sm:px-5" : "px-5";
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg py-2.5 text-base font-semibold no-underline transition-colors duration-200 ${padding} ${variants[variant]} ${className}`;
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
  if (href.startsWith("http")) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

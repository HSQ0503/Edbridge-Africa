import { Container } from "./container";
import { WovenBand } from "./woven";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-sand">
      <Container className="py-12 sm:py-16">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">{eyebrow}</p>
        )}
        <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-xl text-muted">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
      <WovenBand id="page-header-band" />
    </div>
  );
}

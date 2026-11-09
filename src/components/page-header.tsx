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
    <div className="bg-sand" data-enter>
      <Container className="py-12 sm:py-16">
        {eyebrow && (
          <p className="text-label font-medium text-muted">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-xl text-muted">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
      <WovenBand id="page-header-band" />
    </div>
  );
}

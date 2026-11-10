import { Container } from "./container";
import { KenteCloth } from "./kente-cloth/kente-cloth";
import { WovenBand, WovenPanel } from "./woven";

// Each page starts its cloth on a different block, so neighbouring pages don't show the same weave.
function blockShift(title: string) {
  return [...title].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 4;
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  cloth = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  cloth?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-sand" data-enter>
      <Container className={`py-12 sm:py-16 ${cloth ? "grid items-center gap-10 lg:grid-cols-[1.6fr_1fr]" : ""}`}>
        <div>
          {eyebrow && <p className="text-label font-medium text-muted">{eyebrow}</p>}
          <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-xl text-muted">{intro}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {cloth && (
          <KenteCloth strips={7} length={2.2} shift={blockShift(title)} className="hidden aspect-[4/3] w-full lg:block">
            <WovenPanel id="page-header-weave" className="size-full" />
          </KenteCloth>
        )}
      </Container>
      <WovenBand id="page-header-band" />
    </div>
  );
}

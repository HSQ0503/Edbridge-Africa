import { Container } from "./container";

type Tone = "paper" | "sand" | "brand";

const tones: Record<Tone, { section: string; intro: string }> = {
  paper: { section: "bg-paper text-ink", intro: "text-muted" },
  sand: { section: "bg-sand text-ink", intro: "text-muted" },
  brand: { section: "bg-brand text-on-brand", intro: "text-on-brand-muted" },
};

export function Section({
  id,
  title,
  intro,
  tone = "paper",
  children,
}: {
  id: string;
  title?: string;
  intro?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={title ? titleId : undefined} className={tones[tone].section}>
      <Container className="py-14 sm:py-20">
        {title && (
          <h2 id={titleId} className="text-3xl font-bold">
            {title}
          </h2>
        )}
        {intro && <p className={`mt-3 max-w-2xl text-lg ${tones[tone].intro}`}>{intro}</p>}
        <div className={title || intro ? "mt-8" : ""}>{children}</div>
      </Container>
    </section>
  );
}

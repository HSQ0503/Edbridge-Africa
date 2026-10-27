import { Container } from "./container";
import { DraftNotice } from "./notice";
import { PageHeader } from "./page-header";

export function PolicyPage({
  title,
  intro,
  draftNote = "This is a draft outline. EdBridge Africa's Legal Adviser must review and approve the final policy before launch.",
  children,
}: {
  title: string;
  intro: string;
  draftNote?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow="Policies" title={title} intro={intro}>
        <div className="max-w-2xl">
          <DraftNotice>
            <p>{draftNote}</p>
          </DraftNotice>
        </div>
      </PageHeader>
      <Container className="py-14 sm:py-20">
        <div className="prose">
          {children}
          <p className="text-base text-muted">Last updated: [date to be confirmed]</p>
        </div>
      </Container>
    </>
  );
}

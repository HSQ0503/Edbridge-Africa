import { Info, PencilLine, TriangleAlert } from "lucide-react";

type Tone = "info" | "draft" | "urgent";

const tones: Record<Tone, { box: string; icon: React.ReactNode }> = {
  info: { box: "border-brand bg-brand-tint", icon: <Info className="size-6 text-brand" /> },
  draft: { box: "border-accent bg-surface", icon: <PencilLine className="size-6 text-accent-text" /> },
  urgent: { box: "border-danger bg-surface", icon: <TriangleAlert className="size-6 text-danger" /> },
};

export function Notice({ tone = "info", title, children }: { tone?: Tone; title: string; children?: React.ReactNode }) {
  return (
    <div className={`flex gap-3 rounded-xl border-l-4 p-4 sm:p-5 ${tones[tone].box}`}>
      <span aria-hidden="true" className="shrink-0">
        {tones[tone].icon}
      </span>
      <div className="text-base">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 space-y-2">{children}</div>}
      </div>
    </div>
  );
}

export function DraftNotice({ children }: { children?: React.ReactNode }) {
  return (
    <Notice tone="draft" title="Draft for EdBridge to review">
      {children ?? <p>This wording is a starting point. EdBridge Africa will confirm the final text before launch.</p>}
    </Notice>
  );
}

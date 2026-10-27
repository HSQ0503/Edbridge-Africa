export function EmptyState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border-2 border-dashed border-line bg-surface p-6 sm:p-8">
      <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
        {icon}
      </span>
      <h3 className="text-xl font-bold">{title}</h3>
      {children && <div className="max-w-2xl text-base text-muted">{children}</div>}
    </div>
  );
}

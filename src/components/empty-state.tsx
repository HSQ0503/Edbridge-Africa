export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 border-t border-line pt-6">
      <h3 className="text-xl">{title}</h3>
      {children && <div className="max-w-2xl text-base text-muted">{children}</div>}
    </div>
  );
}

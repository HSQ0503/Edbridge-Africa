export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex w-fit items-center rounded-lg bg-brand-tint px-2.5 py-1 text-label font-medium text-brand">
      {children}
    </p>
  );
}

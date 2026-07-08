export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
      {label}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]"
    >
      {message}
    </div>
  );
}

export type ScheduleWindow = "day" | "week" | "month";

export function scheduleWindowDays(window: ScheduleWindow): number {
  if (window === "day") return 1;
  if (window === "week") return 7;
  return 30;
}

export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isWithinScheduleWindow(
  iso: string,
  window: ScheduleWindow,
  now = new Date(),
): boolean {
  const start = now.getTime();
  const end = start + scheduleWindowDays(window) * 24 * 60 * 60 * 1000;
  const value = new Date(iso).getTime();
  return value >= start && value <= end;
}

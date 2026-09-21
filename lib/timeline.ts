const day = (value: string) => Date.parse(value + "T00:00:00Z") / 86400000;
/** Inclusive source dates clipped to the displayed period. Null means no overlap. */
export function timelinePosition(start: string, end: string, periodStart: string, periodEnd: string) {
  const a = Math.max(day(start), day(periodStart));
  const b = Math.min(day(end), day(periodEnd));
  const duration = day(periodEnd) - day(periodStart) + 1;
  if (![a, b, duration].every(Number.isFinite) || duration <= 0 || b < a) return null;
  return { left: (a - day(periodStart)) / duration * 100, width: (b - a + 1) / duration * 100 };
}

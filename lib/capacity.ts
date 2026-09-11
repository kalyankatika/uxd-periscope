import { crafts, type Person, type CapacityPeriod } from "./domain";
export const DAY = 86400000;
export function monday(date: string) {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function weeks(start: string, end: string) {
  const out: string[] = [];
  for (let t = Date.parse(monday(start)); t <= Date.parse(end); t += 7 * DAY)
    out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}
export function capacity(
  people: Person[],
  weekStarts: string[],
): CapacityPeriod[] {
  return crafts.flatMap((craft) =>
    weekStarts.map((weekStart) => ({
      craft,
      weekStart,
      availableFte: people
        .filter((p) => p.craft === craft)
        .reduce((s, p) => s + p.fte * (1 - p.nonProjectPct / 100), 0),
    })),
  );
}
export function utilization(allocated: number, available: number) {
  return available === 0
    ? allocated > 0
      ? Infinity
      : 0
    : allocated / available;
}
export function level(ratio: number) {
  return ratio > 1 + 1e-9 ? "red" : ratio > 0.8 + 1e-9 ? "amber" : "green";
}

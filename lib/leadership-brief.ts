import type { Initiative } from "./domain";

/** Reported state only: dates are relative to the selected planning period. */
export function leadershipBrief(
  projects: Initiative[],
  start: string,
  end: string,
) {
  const open = projects.filter(
    (p) => p.delivery !== "completed" && p.start <= end && p.end >= start,
  );
  const byDueDate = (a: Initiative, b: Initiative) =>
    a.end.localeCompare(b.end) || a.id.localeCompare(b.id);
  return {
    decisions: open
      .filter((p) => p.health === "needs_decision")
      .sort(byDueDate),
    // A decision is shown once in the attention sections, even if also blocked.
    risks: open
      .filter(
        (p) =>
          p.health !== "needs_decision" &&
          (p.health === "at_risk" || p.delivery === "blocked"),
      )
      .sort(byDueDate),
    due: open.filter((p) => p.end >= start && p.end <= end).sort(byDueDate),
  };
}

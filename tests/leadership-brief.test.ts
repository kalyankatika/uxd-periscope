import assert from "node:assert/strict";
import test from "node:test";
import { initiativeSchema } from "../lib/domain";
import { leadershipBrief } from "../lib/leadership-brief";

const project = (id: string, values: Record<string, unknown> = {}) =>
  initiativeSchema.parse({
    id,
    name: id,
    start: "2026-01-01",
    end: "2026-06-30",
    status: "committed",
    effort: { design: 1, research: 0, content: 0, design_eng: 0 },
    ...values,
  });

test("leadership brief separates reported decisions and risks without double-counting blocked decisions", () => {
  const result = leadershipBrief(
    [
      project("decision", { health: "needs_decision", delivery: "blocked" }),
      project("risk", { health: "at_risk" }),
      project("blocked", { delivery: "blocked" }),
      project("complete", { health: "needs_decision", delivery: "completed" }),
      project("old-text", {
        decision: "Historical request",
        health: "on_track",
      }),
    ],
    "2026-04-01",
    "2026-06-30",
  );
  assert.deepEqual(
    result.decisions.map((p) => p.id),
    ["decision"],
  );
  assert.deepEqual(
    result.risks.map((p) => p.id),
    ["blocked", "risk"],
  );
});

test("due dates use the selected period, include boundaries, and preserve input order", () => {
  const projects = [
    project("late", { end: "2026-07-01" }),
    project("end"),
    project("start", { end: "2026-04-01" }),
    project("past", { end: "2026-03-31" }),
    project("done", { delivery: "completed" }),
  ];
  const before = projects.map((p) => p.id);
  const result = leadershipBrief(projects, "2026-04-01", "2026-06-30");
  assert.deepEqual(
    result.due.map((p) => p.id),
    ["start", "end"],
  );
  assert.deepEqual(
    projects.map((p) => p.id),
    before,
  );
});

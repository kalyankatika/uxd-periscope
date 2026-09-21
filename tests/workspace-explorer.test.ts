import { test } from "node:test";
import assert from "node:assert/strict";
import { planSchema, type Plan } from "../lib/domain";
import { getExplorerScope, organizationRef } from "../lib/workspace-explorer";

function fixture(): Plan {
  return planSchema.parse({
    revision: 0,
    people: [
      { id: "head", name: "Alex", managerId: null },
      { id: "lead", name: "Alex", managerId: "head" },
      { id: "report", name: "Riley", managerId: "lead" },
      { id: "other", name: "Alex", managerId: null },
    ].map((p) => ({ ...p, craft: "design", fte: 1, nonProjectPct: 0 })),
    initiatives: [
      {
        id: "shared",
        leadId: "lead",
        memberIds: ["report", "lead"],
        priority: "AI",
        start: "2026-07-01",
        end: "2026-09-30",
      },
      {
        id: "other-project",
        leadId: "other",
        priority: "ai",
        start: "2026-09-30",
        end: "2026-10-31",
        dependsOn: ["shared"],
      },
      {
        id: "earlier",
        leadId: "report",
        priority: "AI",
        start: "2026-06-01",
        end: "2026-07-01",
      },
      { id: "past", leadId: "report", start: "2026-05-01", end: "2026-06-30" },
    ].map((p) => ({
      name: p.id,
      status: "committed",
      effort: { design: 1, research: 0, content: 0, design_eng: 0 },
      ...p,
    })),
  });
}
const scope = (
  plan: Plan,
  kind: "person" | "project" | "priority",
  id: string,
) => getExplorerScope(plan, "2026-07-01", "2026-09-30", { kind, id });

test("Person scopes traverse descendants, deduplicate shared work and distinguish identical display names", () => {
  const plan = fixture();
  const before = structuredClone(plan);
  const head = scope(plan, "person", "head");
  assert.deepEqual(
    head.people.map((p) => p.id),
    ["head", "lead", "report"],
  );
  assert.deepEqual(
    head.projects.map((p) => p.id),
    ["shared", "earlier"],
  );
  assert.deepEqual(
    scope(plan, "person", "other").projects.map((p) => p.id),
    ["other-project"],
  );
  assert.deepEqual(
    head.related
      .filter((r) => r.relation === "Direct report")
      .map((r) => r.ref.id),
    ["lead"],
  );
  assert.deepEqual(plan, before);
});

test("Planning boundaries are inclusive and projects outside the period are excluded from totals", () => {
  const plan = fixture();
  const result = getExplorerScope(
    plan,
    "2026-07-01",
    "2026-09-30",
    organizationRef,
  );
  assert.deepEqual(
    result.projects.map((p) => p.id),
    ["shared", "other-project", "earlier"],
  );
  assert.equal(result.people.length, 4);
  const past = scope(plan, "project", "past");
  assert.equal(past.missing, false);
  assert.equal(past.projects.length, 0);
  assert.match(past.subtitle, /outside planning period/);
  assert.equal(
    getExplorerScope(plan, "2026-09-30", "2026-07-01", organizationRef).projects
      .length,
    0,
  );
});

test("Project connections use IDs for unique participants and dependencies in both directions", () => {
  const plan = fixture();
  const shared = scope(plan, "project", "shared");
  assert.deepEqual(
    shared.people.map((p) => p.id),
    ["lead", "report"],
  );
  assert.equal(
    shared.related.filter((r) => r.ref.kind === "person" && r.ref.id === "lead")
      .length,
    1,
  );
  assert.equal(
    shared.related.find((r) => r.ref.id === "other-project")?.relation,
    "Required by",
  );
  assert.equal(
    scope(plan, "project", "other-project").related.find(
      (r) => r.ref.id === "shared",
    )?.relation,
    "Depends on",
  );
  assert.equal(
    shared.related.find((r) => r.ref.id === "AI")?.ref.kind,
    "priority",
  );
});

test("Priorities match exact label keys and people belong only through related project IDs", () => {
  const result = scope(fixture(), "priority", "AI");
  assert.deepEqual(
    result.projects.map((p) => p.id),
    ["shared", "earlier"],
  );
  assert.deepEqual(
    result.people.map((p) => p.id),
    ["lead", "report"],
  );
  assert.deepEqual(
    scope(fixture(), "priority", "ai").people.map((p) => p.id),
    ["other"],
  );
});

test("Missing navigation targets return empty scopes instead of accidentally exposing organization data", () => {
  const plan = fixture();
  for (const kind of [
    "organization",
    "person",
    "project",
    "priority",
  ] as const) {
    const result = getExplorerScope(plan, "2026-07-01", "2026-09-30", {
      kind,
      id: "missing",
    });
    assert.equal(result.missing, true);
    assert.deepEqual(
      [result.people, result.projects, result.priorities, result.related],
      [[], [], [], []],
    );
  }
});

test("Reporting moves are reflected immediately without rewriting project ownership", () => {
  const plan = fixture();
  plan.people.find((p) => p.id === "report")!.managerId = "other";
  assert.deepEqual(
    scope(plan, "person", "lead").projects.map((p) => p.id),
    ["shared"],
  );
  assert.deepEqual(
    scope(plan, "person", "other").projects.map((p) => p.id),
    ["shared", "other-project", "earlier"],
  );
  assert.equal(plan.initiatives[0].leadId, "lead");
});

test("An empty organization remains a valid starting point", () => {
  const result = getExplorerScope(
    { people: [], initiatives: [], revision: 0 },
    "2026-07-01",
    "2026-09-30",
    organizationRef,
  );
  assert.equal(result.missing, false);
  assert.equal(result.label, "Organization");
  assert.deepEqual(
    [result.people, result.projects, result.priorities, result.related],
    [[], [], [], []],
  );
});

test("A known priority outside the period remains distinguishable from a removed priority", () => {
  const plan = fixture();
  plan.initiatives.find((p) => p.id === "past")!.priority = "Past priority";
  const result = scope(plan, "priority", "Past priority");
  assert.equal(result.missing, false);
  assert.equal(result.label, "Past priority");
  assert.deepEqual(result.projects, []);
  assert.deepEqual(result.people, []);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { leadershipDemo } from "../lib/leadership-demo";
import {
  teamIds,
  leaderProjects,
  relatedProjects,
  workGraph,
} from "../lib/work-graph";
import { planSchema } from "../lib/domain";
import { importCsv, exportCsv } from "../lib/csv";
test("A leader sees work owned by reports and shared work, each project once", () => {
  const p = leadershipDemo();
  const ids = teamIds(p.people, "elena");
  assert.deepEqual([...ids].sort(), ["elena", "jordan", "maya", "nina"]);
  const projects = leaderProjects(p, "elena");
  assert.ok(projects.some((p) => p.id === "opening"));
  assert.ok(projects.some((p) => p.id === "retirement"));
  assert.equal(projects.length, new Set(projects.map((p) => p.id)).size);
  assert.ok(!projects.some((p) => p.id === "components"));
  assert.equal(leaderProjects(p, "uxd-head").length, p.initiatives.length);
});
test("Reporting validation rejects cycles, missing managers and broken project links", () => {
  const p = leadershipDemo();
  assert.throws(
    () =>
      planSchema.parse({
        ...p,
        people: p.people.map((x) =>
          x.id === "uxd-head" ? { ...x, managerId: "maya" } : x,
        ),
      }),
    /cycle/,
  );
  assert.throws(
    () =>
      planSchema.parse({
        ...p,
        people: p.people.map((x) =>
          x.id === "maya" ? { ...x, managerId: "missing" } : x,
        ),
      }),
    /Unknown manager/,
  );
  for (const change of [
    { leadId: "missing" },
    { memberIds: ["missing"] },
    { dependsOn: ["missing"] },
  ])
    assert.throws(() =>
      planSchema.parse({
        ...p,
        initiatives: p.initiatives.map((x, i) =>
          i === 0 ? { ...x, ...change } : x,
        ),
      }),
    );
});
test("Reporting reassignment updates leader rollups without changing project ownership", () => {
  const p = leadershipDemo();
  const moved = planSchema.parse({
    ...p,
    people: p.people.map((x) =>
      x.id === "maya" ? { ...x, managerId: "marcus" } : x,
    ),
  });
  assert.ok(teamIds(moved.people, "marcus").has("maya"));
  assert.ok(!teamIds(moved.people, "elena").has("maya"));
  assert.equal(
    moved.initiatives.find((p) => p.id === "opening")!.leadId,
    "maya",
  );
  assert.ok(leaderProjects(moved, "marcus").some((p) => p.id === "opening"));
});
test("Graph export contains stable, resolvable identity and relationship links", () => {
  const p = leadershipDemo(),
    g = workGraph(p);
  assert.deepEqual(g, workGraph(p));
  const ids = new Set(g["@graph"].map((n) => n["@id"]));
  for (const node of g["@graph"])
    for (const key of [
      "reportsTo",
      "ledBy",
      "contributors",
      "dependsOn",
      "supports",
    ]) {
      const value = node[key];
      for (const target of (Array.isArray(value)
        ? value
        : value
          ? [value]
          : []) as { "@id": string }[])
        assert.ok(ids.has(target["@id"]), `${key} should resolve`);
    }
  const related = relatedProjects(
    p,
    p.initiatives.find((p) => p.id === "opening")!,
  );
  assert.ok(
    related
      .find((p) => p.project.id === "components")
      ?.reasons.includes("Needed by this project"),
  );
});
test("Organization and project relationships round trip through CSV", () => {
  const p = leadershipDemo();
  const people = importCsv("people", exportCsv(p.people));
  const initiatives = importCsv(
    "initiatives",
    exportCsv(p.initiatives.map(({ effort, ...p }) => ({ ...p, ...effort }))),
  );
  assert.deepEqual(planSchema.parse({ ...p, people, initiatives }), p);
});

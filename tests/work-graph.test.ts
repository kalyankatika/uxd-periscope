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

test("Related projects keep all direct dependencies first without truncating or mutating the plan", () => {
  const p = leadershipDemo();
  const before = structuredClone(p);
  const components = p.initiatives.find((p) => p.id === "components")!;
  const related = relatedProjects(p, components);
  assert.deepEqual(
    related.map(({ project }) => project.id),
    [
      "opening",
      "mobile",
      "ai-standards",
      "advisor",
      "insights",
      "statements",
      "coaching",
      "ai-research",
    ],
  );
  assert.deepEqual(related[0].reasons, [
    "Depends on this project",
    "Shared people",
  ]);
  assert.deepEqual(related[2].reasons, [
    "Depends on this project",
    "Shared people",
  ]);
  assert.equal(
    related.length,
    new Set(related.map(({ project }) => project.id)).size,
  );
  assert.deepEqual(p, before);
});

test("Related projects agree with all seven exported dependency edges in both directions", () => {
  const p = leadershipDemo();
  const prerequisitePairs = [
    ["components", "opening"],
    ["components", "mobile"],
    ["components", "ai-standards"],
    ["experience-strategy", "innovation-lab"],
    ["ai-standards", "conversational-prototype"],
    ["insights", "ai-research"],
    ["ai-standards", "ai-research"],
  ];
  const exportedPairs = workGraph(p)["@graph"].flatMap((node) =>
    node["@type"] === "schema:Project"
      ? (node.dependsOn as { "@id": string }[]).map((prerequisite) => [
          prerequisite["@id"],
          node["@id"],
        ])
      : [],
  );
  assert.deepEqual(
    exportedPairs.sort(),
    prerequisitePairs
      .map((pair) => pair.map((id) => `urn:periscope:project:${id}`))
      .sort(),
  );
  for (const project of p.initiatives) {
    const related = relatedProjects(p, project);
    assert.deepEqual(
      related
        .filter(({ reasons }) => reasons.includes("Needed by this project"))
        .map(({ project }) => project.id)
        .sort(),
      prerequisitePairs
        .filter(([, dependent]) => dependent === project.id)
        .map(([prerequisite]) => prerequisite)
        .sort(),
      `${project.id}: prerequisites`,
    );
    assert.deepEqual(
      related
        .filter(({ reasons }) => reasons.includes("Depends on this project"))
        .map(({ project }) => project.id)
        .sort(),
      prerequisitePairs
        .filter(([prerequisite]) => prerequisite === project.id)
        .map(([, dependent]) => dependent)
        .sort(),
      `${project.id}: dependents`,
    );
  }
});

test("Shared people include opposite lead and contributor roles symmetrically", () => {
  const p = leadershipDemo();
  const opening = p.initiatives.find((p) => p.id === "opening")!;
  const retirement = p.initiatives.find((p) => p.id === "retirement")!;
  for (const [project, other] of [
    [opening, retirement],
    [retirement, opening],
  ]) {
    const related = relatedProjects(p, project).filter(
      ({ project }) => project.id === other.id,
    );
    assert.equal(related.length, 1);
    assert.deepEqual(related[0].reasons, ["Shared people"]);
  }
});

test("A person present as both lead and contributor contributes one relationship reason", () => {
  const p = leadershipDemo();
  const project = {
    ...p.initiatives[0],
    leadId: "maya",
    memberIds: ["maya"],
    priority: "",
    dependsOn: [],
  };
  const other = {
    ...p.initiatives[1],
    leadId: "maya",
    memberIds: ["maya"],
    priority: "",
    dependsOn: [],
  };
  const plan = planSchema.parse({ ...p, initiatives: [project, other] });
  assert.deepEqual(relatedProjects(plan, project), [
    { project: other, reasons: ["Shared people"] },
  ]);
});

test("Matching display names do not connect different person IDs", () => {
  const p = leadershipDemo();
  const projects = p.initiatives.slice(0, 2).map((project, index) => ({
    ...project,
    leadId: index === 0 ? "maya" : "leo",
    memberIds: [],
    priority: "",
    dependsOn: [],
  }));
  const plan = planSchema.parse({
    ...p,
    people: p.people.map((person) => ({ ...person, name: "Alex Morgan" })),
    initiatives: projects,
  });
  assert.deepEqual(relatedProjects(plan, plan.initiatives[0]), []);
  assert.deepEqual(relatedProjects(plan, plan.initiatives[1]), []);
});

test("Renaming people and projects preserves ID-based relationships", () => {
  const p = leadershipDemo();
  const renamed = planSchema.parse({
    ...p,
    people: p.people.map((person) => ({
      ...person,
      name: `Renamed ${person.id}`,
    })),
    initiatives: p.initiatives.map((project) => ({
      ...project,
      name: `Renamed ${project.id}`,
    })),
  });
  for (const project of p.initiatives) {
    const relationships = (plan: typeof p) =>
      relatedProjects(
        plan,
        plan.initiatives.find((p) => p.id === project.id)!,
      ).map(({ project, reasons }) => ({ id: project.id, reasons }));
    assert.deepEqual(relationships(renamed), relationships(p));
  }
});

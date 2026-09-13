import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { inspectCsv } from "../lib/csv";
import { planSchema, type Plan } from "../lib/domain";
import { previewWorkspaceImport } from "../lib/import-preview";
import { leadershipDemo } from "../lib/leadership-demo";
import { buildDemoFiles } from "../scripts/generate-demo-data";

const fixture = (name: string) =>
  readFileSync(
    new URL(`../examples/uxd-demo/${name}`, import.meta.url),
    "utf8",
  );
const workspace = (): Plan =>
  planSchema.parse(JSON.parse(fixture("workspace.json")));

test("Checked-in UXD fixtures are deterministic and match the session-only example", () => {
  const generated = buildDemoFiles();
  assert.deepEqual(buildDemoFiles(), generated);
  assert.deepEqual(Object.keys(generated).sort(), [
    "manifest.json",
    "people.csv",
    "projects.csv",
    "workspace.json",
  ]);
  for (const [name, content] of Object.entries(generated))
    assert.equal(fixture(name), content, `${name}: regenerate the demo files`);
  assert.deepEqual(workspace(), leadershipDemo());
  assert.equal(workspace().revision, 0);
});

test("Both readable CSV files import as the complete JSON workspace without ignored fields", () => {
  const inspections = {
    people: inspectCsv("people", fixture("people.csv")),
    initiatives: inspectCsv("initiatives", fixture("projects.csv")),
  };
  assert.deepEqual(inspections.people.ignored, []);
  assert.deepEqual(inspections.initiatives.ignored, []);
  assert.equal(inspections.people.columns.length, 9);
  assert.equal(inspections.initiatives.columns.length, 20);
  assert.ok(
    inspections.people.conversions.some(
      (conversion) =>
        conversion.from === "Design engineering" &&
        conversion.to === "design_eng",
    ),
  );
  assert.ok(
    inspections.initiatives.conversions.some(
      (conversion) =>
        conversion.from === "Needs decision" &&
        conversion.to === "needs_decision",
    ),
  );
  const preview = previewWorkspaceImport(
    { people: [], initiatives: [], revision: 0 },
    inspections,
    true,
  );
  assert.deepEqual(preview.errors, []);
  assert.deepEqual(preview.plan, workspace());
});

test("Demo counts and the cross-team Research rollup retain the documented showcase", () => {
  const plan = workspace();
  const manifest = JSON.parse(fixture("manifest.json"));
  assert.equal(manifest.fictional, true);
  assert.equal(manifest.datasetVersion, 1);
  assert.equal(manifest.period.selectMonth, "2026-10");
  assert.deepEqual(manifest.counts, {
    people: 26,
    projects: 13,
    headOfUxd: 1,
    functionalLeaders: 7,
    functionalTeams: 7,
    priorities: 7,
    dependencies: 7,
    topPriorityProjects: 5,
    projectsNeedingAttention: 5,
  });
  assert.equal(plan.people.length, 26);
  assert.equal(plan.initiatives.length, 13);
  assert.equal(
    new Set(plan.initiatives.map((project) => project.priority)).size,
    7,
  );
  assert.equal(
    plan.initiatives.reduce(
      (sum, project) => sum + project.dependsOn.length,
      0,
    ),
    7,
  );
  assert.deepEqual(
    plan.people
      .filter((person) => person.managerId === "uxd-head")
      .map((person) => person.id)
      .sort(),
    ["daniel", "elena", "marcus", "priya", "riley", "sana", "victor"],
  );

  // Independent ID traversal checks the fixture, without using product rollup helpers.
  const researchScope = new Set(["marcus"]);
  let previousSize = -1;
  while (researchScope.size !== previousSize) {
    previousSize = researchScope.size;
    for (const person of plan.people)
      if (person.managerId && researchScope.has(person.managerId))
        researchScope.add(person.id);
  }
  assert.deepEqual([...researchScope].sort(), [
    "amara",
    "ethan",
    "marcus",
    "sofia",
  ]);
  const researchProjects = plan.initiatives.filter((project) =>
    [project.leadId, ...project.memberIds].some(
      (id) => id !== null && researchScope.has(id),
    ),
  );
  assert.deepEqual(researchProjects.map((project) => project.id).sort(), [
    "advisor",
    "ai-research",
    "coaching",
    "conversational-prototype",
    "experience-strategy",
    "insights",
    "opening",
    "retirement",
  ]);
});

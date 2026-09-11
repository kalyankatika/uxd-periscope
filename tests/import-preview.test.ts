import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectCsv, exportCsv, csvFieldLabels } from "../lib/csv";
import { previewImport } from "../lib/import-preview";
import { leadershipDemo } from "../lib/leadership-demo";

test("Friendly source headers and explicit label aliases map without changing identity", () => {
  const inspection = inspectCsv(
    "people",
    "Employee ID,Full name,Discipline,Working time (FTE),Non-project time (%),Manager ID,Leader,Team\n0007,Alex Example,Product Design,1,20,,Yes,UX AI",
  );
  const person = inspection.rows[0];
  assert.equal(person.id, "0007");
  assert.ok(
    "craft" in person &&
      person.craft === "design" &&
      person.team === "UX AI" &&
      person.isLeader,
  );
  assert.ok(
    inspection.columns.some(
      (c) => c.source === "Employee ID" && c.target === "id",
    ),
  );
  assert.ok(
    inspection.conversions.some(
      (c) => c.from === "Product Design" && c.to === "design",
    ),
  );
  assert.throws(
    () =>
      inspectCsv(
        "people",
        "id,name,craft,fte,nonProjectPct,isLeader\np1,Name,design,1,20,maybe",
      ),
    /Leader must/,
  );
  assert.throws(
    () =>
      inspectCsv(
        "people",
        "id,Employee ID,name,craft,fte,nonProjectPct\np1,p2,Name,design,1,20",
      ),
    /Multiple columns/,
  );
  assert.throws(
    () =>
      inspectCsv(
        "people",
        "id,name,craft,fte,nonProjectPct\np1,Name,UX AI,1,20",
      ),
    /Unrecognized Discipline/,
  );
});

test("All exported project labels can be reviewed, including backlog and health aliases", () => {
  const plan = leadershipDemo();
  const rows = plan.initiatives.map(({ effort, ...project }) =>
    Object.fromEntries(
      Object.entries({ ...project, ...effort }).map(([key, value]) => [
        csvFieldLabels[key],
        key === "status"
          ? "Backlog"
          : key === "health"
            ? "Decision required"
            : value,
      ]),
    ),
  );
  const inspected = inspectCsv("initiatives", exportCsv(rows));
  assert.equal(inspected.rows.length, 13);
  assert.ok(
    inspected.rows.every(
      (p) =>
        "status" in p &&
        p.status === "stretch" &&
        p.health === "needs_decision",
    ),
  );
  const preview = previewImport(plan, "initiatives", inspected, false);
  assert.deepEqual(preview.errors, []);
  assert.equal(preview.updated, 13);
  assert.equal(preview.removed, 0);
});

test("Import review blocks missing relationships and inconsistent taxonomy without mutating the workspace", () => {
  const plan = leadershipDemo(),
    before = structuredClone(plan);
  const person = {
    ...plan.people[0],
    id: "new-id",
    managerId: "missing",
    team: "product design",
  };
  const preview = previewImport(
    plan,
    "people",
    inspectCsv("people", exportCsv([person])),
    false,
  );
  assert.ok(preview.errors.some((s) => s.includes("Unknown manager")));
  assert.ok(preview.errors.some((s) => s.includes("Conflicting team labels")));
  assert.equal(preview.added, 1);
  assert.deepEqual(plan, before);
  const replacing = previewImport(
    plan,
    "people",
    inspectCsv(
      "people",
      exportCsv([{ ...person, managerId: null, team: "Product Design" }]),
    ),
    true,
  );
  assert.ok(replacing.errors.some((s) => s.includes("Unknown project lead")));
  assert.equal(replacing.removed, plan.people.length);
});

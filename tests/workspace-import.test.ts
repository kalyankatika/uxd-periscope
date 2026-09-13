import { test } from "node:test";
import assert from "node:assert/strict";
import { exportCsv, inspectCsv, type CsvInspection } from "../lib/csv";
import {
  initiativeSchema,
  personSchema,
  type Initiative,
  type Person,
  type Plan,
} from "../lib/domain";
import { previewImport, previewWorkspaceImport } from "../lib/import-preview";

const person = (id: string, overrides: Partial<Person> = {}): Person =>
  personSchema.parse({
    id,
    name: `Person ${id}`,
    craft: "design",
    fte: 1,
    nonProjectPct: 20,
    ...overrides,
  });

const project = (id: string, overrides: Partial<Initiative> = {}): Initiative =>
  initiativeSchema.parse({
    id,
    name: `Project ${id}`,
    start: "2026-09-01",
    end: "2026-12-01",
    status: "committed",
    effort: { design: 1, research: 0, content: 0, design_eng: 0 },
    ...overrides,
  });

const inspections = (people: Person[], initiatives: Initiative[]) => ({
  people: inspectCsv("people", exportCsv(people)),
  initiatives: inspectCsv(
    "initiatives",
    exportCsv(initiatives.map(({ effort, ...row }) => ({ ...row, ...effort }))),
  ),
});

const currentPlan = (): Plan => ({
  revision: 17,
  people: [
    person("old-leader", { isLeader: true, team: "Product Design" }),
    person("old-report", { managerId: "old-leader", team: "Product Design" }),
  ],
  initiatives: [
    project("old-project", {
      leadId: "old-leader",
      memberIds: ["old-report"],
      dependsOn: ["future-project"],
    }),
    project("future-project", {
      leadId: "old-report",
      start: "2028-01-01",
      end: "2028-03-01",
    }),
  ],
});

test("A complete new organization replaces both files without an invalid intermediate roster", () => {
  const plan = currentPlan();
  const incoming = inspections(
    [
      person("new-leader", { isLeader: true }),
      person("new-report", { managerId: "new-leader" }),
    ],
    [
      project("new-project", {
        leadId: "new-leader",
        memberIds: ["new-report"],
        dependsOn: ["next-project"],
      }),
      project("next-project", {
        leadId: "new-report",
        start: "2028-04-01",
        end: "2028-06-01",
      }),
    ],
  );
  assert.ok(
    previewImport(plan, "people", incoming.people, true).errors.some((error) =>
      error.includes("Unknown project lead"),
    ),
  );
  assert.ok(
    previewImport(plan, "initiatives", incoming.initiatives, true).errors.some(
      (error) => error.includes("Unknown project lead"),
    ),
  );

  const preview = previewWorkspaceImport(plan, incoming, true);
  assert.deepEqual(preview.errors, []);
  assert.deepEqual(preview.counts, {
    people: { added: 2, updated: 0, removed: 2 },
    initiatives: { added: 2, updated: 0, removed: 2 },
  });
  assert.deepEqual(preview.plan.people, incoming.people.rows);
  assert.deepEqual(preview.plan.initiatives, incoming.initiatives.rows);
  assert.equal(preview.plan.initiatives[1].start, "2028-04-01");
});

test("Merge keeps omitted records and reports each dataset's changes without mutating inputs or revision", () => {
  const plan = currentPlan();
  const incoming = inspections(
    [
      { ...plan.people[0], title: "Head of Product Design" },
      person("new-report", { managerId: "old-leader" }),
    ],
    [
      { ...plan.initiatives[0], memberIds: ["old-report", "new-report"] },
      project("new-project", { leadId: "new-report" }),
    ],
  );
  const before = structuredClone({ plan, incoming });
  const preview = previewWorkspaceImport(plan, incoming, false);

  assert.deepEqual(preview.errors, []);
  assert.deepEqual(preview.counts, {
    people: { added: 1, updated: 1, removed: 0 },
    initiatives: { added: 1, updated: 1, removed: 0 },
  });
  assert.equal(preview.plan.people.length, 3);
  assert.equal(preview.plan.initiatives.length, 3);
  assert.deepEqual(
    preview.plan.initiatives.find((row) => row.id === "future-project"),
    plan.initiatives[1],
  );
  assert.deepEqual(
    preview.plan.people.find((row) => row.id === "old-report"),
    plan.people[1],
  );
  assert.equal(preview.plan.revision, 17);
  assert.deepEqual({ plan, incoming }, before);
});

test("Replace counts retained IDs as updates and removes both omitted datasets", () => {
  const plan = currentPlan();
  const incoming = inspections(
    [{ ...plan.people[0], title: "Design leader" }, person("new-person")],
    [
      { ...plan.initiatives[0], memberIds: [], dependsOn: [] },
      project("new-project", { leadId: "new-person" }),
    ],
  );
  const preview = previewWorkspaceImport(plan, incoming, true);
  assert.deepEqual(preview.errors, []);
  assert.deepEqual(preview.counts, {
    people: { added: 1, updated: 1, removed: 1 },
    initiatives: { added: 1, updated: 1, removed: 1 },
  });
  assert.ok(!preview.plan.people.some((row) => row.id === "old-report"));
  assert.ok(
    !preview.plan.initiatives.some((row) => row.id === "future-project"),
  );
});

test("Leading zeros and case-sensitive IDs remain distinct even when names match", () => {
  const incoming = inspections(
    ["0007", "7", "PX", "px"].map((id) => person(id, { name: "Same Name" })),
    [
      project("0009", {
        name: "Same Project",
        leadId: "0007",
        memberIds: ["7", "PX", "px"],
        dependsOn: ["9", "PROJ", "proj"],
      }),
      ...["9", "PROJ", "proj"].map((id) =>
        project(id, { name: "Same Project", leadId: "px" }),
      ),
    ],
  );
  const preview = previewWorkspaceImport(currentPlan(), incoming, true);
  assert.deepEqual(preview.errors, []);
  assert.deepEqual(
    preview.plan.people.map((row) => row.id),
    ["0007", "7", "PX", "px"],
  );
  assert.deepEqual(
    preview.plan.initiatives.map((row) => row.id),
    ["0009", "9", "PROJ", "proj"],
  );
  assert.equal(preview.plan.initiatives[0].leadId, "0007");

  for (const unresolved of ["Same Name", "Px", "00007"]) {
    const invalid = structuredClone(incoming);
    (invalid.initiatives.rows[0] as Initiative).leadId = unresolved;
    assert.ok(
      previewWorkspaceImport(currentPlan(), invalid, true).errors.some(
        (error) => error.includes("Unknown project lead"),
      ),
    );
  }
});

test("Combined validation blocks missing managers, owners, contributors and dependencies", () => {
  const cases: {
    people?: Partial<Person>;
    project?: Partial<Initiative>;
    error: string;
  }[] = [
    { people: { managerId: "unknown" }, error: "Unknown manager" },
    { project: { leadId: "unknown" }, error: "Unknown project lead" },
    { project: { memberIds: ["unknown"] }, error: "Unknown contributor" },
    {
      project: { dependsOn: ["unknown"] },
      error: "Invalid project dependency",
    },
    { project: { dependsOn: ["p1"] }, error: "Invalid project dependency" },
    { project: { dependsOn: ["p2", "p2"] }, error: "Duplicate dependencies" },
    { project: { memberIds: ["u1", "u1"] }, error: "Duplicate contributors" },
  ];
  for (const value of cases) {
    const incoming = inspections(
      [person("u1", value.people)],
      [project("p1", value.project), project("p2")],
    );
    const preview = previewWorkspaceImport(currentPlan(), incoming, true);
    assert.ok(
      preview.errors.some((error) => error.includes(value.error)),
      value.error,
    );
  }
});

test("Reporting cycles and inconsistent team or priority labels block the combined plan", () => {
  const incoming = inspections(
    [
      person("leader", { managerId: "report", team: "Design Strategy" }),
      person("report", { managerId: "leader", team: "design   strategy" }),
    ],
    [project("a", { priority: "UX AI" }), project("b", { priority: "ux ai" })],
  );
  const preview = previewWorkspaceImport(currentPlan(), incoming, true);
  for (const expected of [
    "Reporting cycle",
    "Conflicting team labels",
    "Conflicting business priority labels",
  ])
    assert.ok(
      preview.errors.some((error) => error.includes(expected)),
      expected,
    );
});

test("Merge validates taxonomy against omitted existing records", () => {
  const plan = currentPlan();
  plan.initiatives[0].priority = "Customer Experience";
  const incoming = inspections(
    [person("new-person", { team: "product design" })],
    [project("new-project", { priority: "customer experience" })],
  );
  const preview = previewWorkspaceImport(plan, incoming, false);
  assert.ok(
    preview.errors.some((error) => error.includes("Conflicting team labels")),
  );
  assert.ok(
    preview.errors.some((error) =>
      error.includes("Conflicting business priority labels"),
    ),
  );
});

test("Schema validation rejects malformed inspected rows and duplicate IDs without throwing", () => {
  const valid = inspections([person("u1")], [project("p1")]);
  const cases: {
    kind: "people" | "initiatives";
    rows: unknown[];
    expected?: string;
  }[] = [
    {
      kind: "people",
      rows: [person("u1"), person("u1")],
      expected: "Duplicate people IDs",
    },
    {
      kind: "initiatives",
      rows: [project("p1"), project("p1")],
      expected: "Duplicate initiatives IDs",
    },
    { kind: "people", rows: [{ ...person("u1"), team: 1 }] },
    { kind: "people", rows: [null] },
    { kind: "people", rows: [project("wrong-type")] },
    { kind: "initiatives", rows: [{ ...project("p1"), memberIds: "u1" }] },
    { kind: "initiatives", rows: [{ ...project("p1"), priority: false }] },
    { kind: "initiatives", rows: [{ ...project("p1"), status: "unknown" }] },
  ];
  for (const value of cases) {
    const incoming = structuredClone(valid);
    incoming[value.kind].rows = value.rows as CsvInspection["rows"];
    const before = structuredClone(incoming);
    const preview = previewWorkspaceImport(currentPlan(), incoming, true);
    assert.ok(preview.errors.length > 0);
    if (value.expected)
      assert.ok(
        preview.errors.some((error) => error.includes(value.expected!)),
      );
    assert.deepEqual(incoming, before);
  }
});

test("The combined preview blocks plans over the UTF-8 save limit even when each file is smaller", () => {
  const people = [person("u1", { name: "é".repeat(550_000) })];
  const initiatives = [
    project("p1", { name: "é".repeat(550_000), leadId: "u1" }),
  ];
  const incoming = inspections(people, initiatives);
  const preview = previewWorkspaceImport(currentPlan(), incoming, true);
  const serialized = JSON.stringify(preview.plan);
  assert.ok(serialized.length < 2_000_000);
  assert.ok(new TextEncoder().encode(serialized).byteLength > 2_000_000);
  for (const rows of [people, initiatives])
    assert.ok(new TextEncoder().encode(exportCsv(rows)).byteLength < 2_000_000);
  assert.equal(preview.errors.length, 1);
  assert.match(preview.errors[0], /2,000,000-byte save limit/);
});

test("The exact save-size boundary is accepted and one extra byte is blocked", () => {
  const plan: Plan = { people: [], initiatives: [], revision: 9 };
  const incoming = inspections([person("u1", { name: "x" })], [project("p1")]);
  const baseline = previewWorkspaceImport(plan, incoming, true);
  const bytes = new TextEncoder().encode(
    JSON.stringify(baseline.plan),
  ).byteLength;
  (incoming.people.rows[0] as Person).name = "x".repeat(2_000_000 - bytes + 1);
  assert.deepEqual(previewWorkspaceImport(plan, incoming, true).errors, []);
  (incoming.people.rows[0] as Person).name += "x";
  assert.ok(
    previewWorkspaceImport(plan, incoming, true).errors.some((error) =>
      error.includes("save limit"),
    ),
  );
});

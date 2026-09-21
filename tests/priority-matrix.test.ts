import assert from "node:assert/strict";
import test from "node:test";
import { personSchema, initiativeSchema, type Plan } from "../lib/domain";
import { buildGraph, graphId } from "../lib/graph-model";
import { buildPriorityMatrix } from "../lib/priority-matrix";
const person = (id: string, managerId: string | null) =>
  personSchema.parse({
    id,
    managerId,
    name: "Same name",
    isLeader: true,
    craft: "design",
    fte: 1,
    nonProjectPct: 0,
  });
const project = (id: string, leadId: string | null, priority: string) =>
  initiativeSchema.parse({
    id,
    leadId,
    priority,
    memberIds: ["b"],
    name: "Same project",
    start: "2026-01-01",
    end: "2026-12-31",
    status: "committed",
    effort: { design: 1, research: 0, content: 0, design_eng: 0 },
  });
const plan: Plan = {
  revision: 0,
  people: [
    person("head", null),
    person("a", "head"),
    person("b", "head"),
    person("nested", "a"),
  ],
  initiatives: [
    project("one", "nested", "Growth"),
    project("two", "b", "Growth"),
    project("three", null, ""),
  ],
};
const graph = buildGraph(plan, "2026-01-01", "2026-12-31");

test("matrix counts each visible project once under its accountable group and priority", () => {
  const result = buildPriorityMatrix(graph.nodes, plan);
  assert.equal(result.projectCount, 3);
  assert.equal(
    result.rows.reduce(
      (sum, row) =>
        sum + row.cells.reduce((sum, cell) => sum + cell.projects.length, 0),
      0,
    ),
    3,
  );
  assert.deepEqual(
    result.rows
      .find((row) => row.id === "team:a")
      ?.cells[0].projects.map((p) => p.recordId),
    ["one"],
  );
  assert.deepEqual(
    result.rows
      .find((row) => row.id === "team:b")
      ?.cells[0].projects.map((p) => p.recordId),
    ["two"],
  );
  assert.equal(result.columns.at(-1)?.label, "Unaligned work");
  assert.equal(
    result.rows.find((row) => row.id === "unassigned")?.cells.at(-1)
      ?.projects[0].recordId,
    "three",
  );
});

test("scoped matrix uses full hierarchy without adding hidden projects or priority columns", () => {
  const nodes = graph.nodes.filter((n) => n.id === graphId("project", "one"));
  const result = buildPriorityMatrix([...nodes, ...nodes], plan);
  assert.equal(result.projectCount, 1);
  assert.deepEqual(
    result.rows.map((row) => row.id),
    ["team:a"],
  );
  assert.deepEqual(
    result.columns.map((column) => column.label),
    ["Growth"],
  );
  assert.equal(
    buildPriorityMatrix(
      graph.nodes.filter((n) => n.kind !== "project"),
      plan,
    ).rows.length,
    0,
  );
});

test("missing source project stays visible as unassigned and unaligned without mutation", () => {
  const nodes = graph.nodes.filter((n) => n.id === graphId("project", "one"));
  const before = structuredClone(nodes);
  const result = buildPriorityMatrix(nodes, { ...plan, initiatives: [] });
  assert.equal(result.rows[0].id, "unassigned");
  assert.equal(result.columns[0].id, "unaligned");
  assert.equal(result.projectCount, 1);
  assert.deepEqual(nodes, before);
});

test("priority keys retain exact source values to match graph identity", () => {
  const source = structuredClone(plan);
  source.initiatives[1].priority = " Growth";
  const result = buildPriorityMatrix(graph.nodes, source);
  assert.equal(result.columns.length, 3);
  assert.ok(result.columns.some((column) => column.id === "priority: Growth"));
  assert.ok(result.columns.some((column) => column.id === "priority:Growth"));
});

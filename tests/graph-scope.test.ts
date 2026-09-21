import { test } from "node:test";
import assert from "node:assert/strict";
import { leadershipDemo } from "../lib/leadership-demo";
import { buildGraph, graphId, reportingGraph } from "../lib/graph-model";
import { scopeGraph } from "../lib/graph-scope";
import { leaderProjects, teamIds } from "../lib/work-graph";

const plan = leadershipDemo();
const graph = buildGraph(plan, "2026-10-01", "2026-12-31");

test("Person context includes all descendants and their projects using IDs", () => {
  const scope = scopeGraph(graph, plan, graphId("person", "elena"));
  const ids = new Set(scope.nodes.map((n) => n.id));
  for (const id of teamIds(plan.people, "elena"))
    assert.ok(ids.has(graphId("person", id)), id);
  assert.ok(ids.has(graphId("person", "nina")), "deep descendant retained");
  for (const p of leaderProjects(plan, "elena"))
    assert.ok(ids.has(graphId("project", p.id)), p.id);
  const duplicateNames = {
    ...plan,
    people: plan.people.map((p) => ({ ...p, name: "Same name" })),
  };
  const duplicateGraph = buildGraph(duplicateNames, "2026-10-01", "2026-12-31");
  assert.deepEqual(
    scopeGraph(
      duplicateGraph,
      duplicateNames,
      graphId("person", "elena"),
    ).nodes.map((n) => n.id),
    scope.nodes.map((n) => n.id),
  );
});

test("Person context honors graph period and excludes external dependency projects", () => {
  const scope = scopeGraph(graph, plan, graphId("person", "elena"));
  const primary = new Set(leaderProjects(plan, "elena").map((p) => p.id));
  assert.deepEqual(
    new Set(
      scope.nodes.filter((n) => n.kind === "project").map((n) => n.recordId),
    ),
    primary,
  );
  const emptyPeriod = buildGraph(plan, "2030-01-01", "2030-03-31");
  assert.equal(
    scopeGraph(emptyPeriod, plan, graphId("person", "elena")).nodes.filter(
      (n) => n.kind === "project",
    ).length,
    0,
  );
  const december = buildGraph(plan, "2026-12-01", "2026-12-31");
  const scoped = scopeGraph(december, plan, graphId("person", "elena"));
  const valid = new Set(december.nodes.map((n) => n.id));
  assert.ok(scoped.nodes.every((n) => valid.has(n.id)));
  const scopedIds = new Set(scoped.nodes.map((n) => n.id));
  assert.ok(
    scoped.links.every(
      (e) => scopedIds.has(e.source) && scopedIds.has(e.target),
    ),
  );
});

test("Project and priority contexts retain linked people and reporting remains descendants only", () => {
  const selected = graphId("project", "opening");
  const scoped = scopeGraph(graph, plan, selected);
  const ids = new Set(scoped.nodes.map((n) => n.id));
  for (const edge of graph.links.filter(
    (e) => e.source === selected || e.target === selected,
  )) {
    assert.ok(ids.has(edge.source));
    assert.ok(ids.has(edge.target));
  }
  const priority = graph.nodes.find((n) => n.kind === "priority")!;
  const priorityIds = new Set(
    scopeGraph(graph, plan, priority.id).nodes.map((n) => n.id),
  );
  for (const edge of graph.links.filter(
    (e) => e.kind === "supports" && e.target === priority.id,
  ))
    assert.ok(priorityIds.has(edge.source));
  const reporting = reportingGraph(graph, graphId("person", "elena"));
  assert.deepEqual(
    new Set(reporting.nodes.map((n) => n.recordId)),
    teamIds(plan.people, "elena"),
  );
  assert.equal(scopeGraph(graph, plan, null), graph);
});

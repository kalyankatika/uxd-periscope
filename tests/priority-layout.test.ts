import assert from "node:assert/strict";
import test from "node:test";
import { initiativeSchema, personSchema, type Plan } from "../lib/domain";
import { buildGraph, graphId } from "../lib/graph-model";
import { layoutPriorityGraph } from "../lib/priority-layout";

const fixture = (): Plan => ({
  revision: 0,
  people: ["a", "b"].map(id => personSchema.parse({ id, name: "Same name", craft: "design", fte: 1, nonProjectPct: 0 })),
  initiatives: ["Growth", "Growth", "Trust", ""].map((priority, i) => initiativeSchema.parse({
    id: `p${i}`, name: "Same project", priority, leadId: "a", memberIds: ["b"],
    start: "2026-01-01", end: "2026-12-31", status: "committed",
    effort: { design: 1, research: 0, content: 0, design_eng: 0 },
  })),
});

test("priority layout preserves all IDs once and exact project counts without assigning people to priorities", () => {
  const plan = fixture(), graph = buildGraph(plan, "2026-01-01", "2026-12-31");
  const before = JSON.stringify({ plan, graph });
  const result = layoutPriorityGraph(graph, plan);
  assert.deepEqual(result.nodes.map(n => n.id).sort(), graph.nodes.map(n => n.id).sort());
  assert.equal(result.groups.find(g => g.label === "Growth")!.projectCount, 2);
  assert.equal(result.groups.find(g => g.id === "unaligned")!.projectCount, 1);
  assert.equal(result.groups.find(g => g.id === "people")!.peopleCount, 2);
  assert.equal(result.groups.reduce((sum, g) => sum + g.projectCount, 0), 4);
  assert.equal(JSON.stringify({ plan, graph }), before);
});

test("hidden priorities retain explicit grouping without adding invisible nodes", () => {
  const plan = fixture(), graph = buildGraph(plan, "2026-01-01", "2026-12-31");
  const scoped = { nodes: graph.nodes.filter(n => n.id === graphId("project", "p0")), links: [] };
  const result = layoutPriorityGraph(scoped, plan);
  assert.equal(result.nodes.length, 1);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].label, "Growth");
  assert.equal(result.groups[0].projectCount, 1);
});

test("priority layout is deterministic and centers cells within aligned panels on desktop and mobile", () => {
  const plan = fixture(), graph = buildGraph(plan, "2026-01-01", "2026-12-31");
  for (const columns of [1, 3] as const) {
    const result = layoutPriorityGraph(graph, plan, columns);
    assert.deepEqual(layoutPriorityGraph({nodes: [...graph.nodes].reverse(), links: [...graph.links].reverse()}, plan, columns), result);
    for (const group of result.groups) {
      const nodes = result.nodes.filter(n => n.groupId === group.id);
      for (const n of nodes) {
        assert.ok(n.x > group.x && n.x < group.x + group.width);
        assert.ok(n.y > group.y && n.y < group.y + group.height);
      }
      if (columns === 1) assert.equal(group.x, 0);
    }
  }
  assert.deepEqual(layoutPriorityGraph({ nodes: [], links: [] }, plan), { nodes: [], groups: [] });
});

test("duplicate priority labels remain separate by ID and ambiguous links never duplicate a project", () => {
  const plan: Plan = { revision: 0, people: [], initiatives: [] };
  const node = (id: string, kind: "priority" | "project") => ({ id, recordId: id, kind, label: "Same label", subtitle: "", attention: false, top: false });
  const graph = {
    nodes: [node("priority-a", "priority"), node("priority-b", "priority"), node("project-a", "project"), node("project-b", "project"), node("ambiguous", "project")],
    links: [
      { id: "a", source: "project-a", target: "priority-a", kind: "supports" as const },
      { id: "b", source: "project-b", target: "priority-b", kind: "supports" as const },
      { id: "c", source: "ambiguous", target: "priority-a", kind: "supports" as const },
      { id: "d", source: "ambiguous", target: "priority-b", kind: "supports" as const },
    ],
  };
  const result = layoutPriorityGraph(graph, plan);
  assert.equal(result.nodes.find(n => n.id === "project-a")!.groupId, "priority:priority-a");
  assert.equal(result.nodes.find(n => n.id === "project-b")!.groupId, "priority:priority-b");
  assert.equal(result.nodes.find(n => n.id === "ambiguous")!.groupId, "unaligned");
  assert.equal(result.nodes.length, graph.nodes.length);
});

test("people have a separate final row without inflating priority panels", () => {
  const plan = fixture();
  plan.people = Array.from({ length: 27 }, (_, i) => personSchema.parse({
    id: `person-${i}`, name: `Person ${i}`, craft: "design", fte: 1, nonProjectPct: 0,
  }));
  const graph = buildGraph(plan, "2026-01-01", "2026-12-31");
  for (const columns of [1, 3] as const) {
    const result = layoutPriorityGraph(graph, plan, columns);
    const people = result.groups.find(g => g.id === "people")!;
    const withoutPeople = layoutPriorityGraph({ nodes: graph.nodes.filter(n => n.kind === "project" || n.kind === "priority"), links: graph.links }, plan, columns);
    assert.deepEqual(result.groups.filter(g => g.id !== "people"), withoutPeople.groups);
    assert.equal(people.width, columns === 3 ? 1612 : 500);
    assert.ok(result.groups.filter(g => g.id !== "people").every(g => g.y + g.height < people.y));
    const personNodes = result.nodes.filter(n => n.groupId === "people");
    assert.equal(personNodes.length, 27);
    assert.equal(new Set(personNodes.map(n => n.y)).size, columns === 3 ? 3 : 9);
    assert.ok(personNodes.every(n => n.x > people.x && n.x < people.x + people.width && n.y > people.y && n.y < people.y + people.height));
  }
});

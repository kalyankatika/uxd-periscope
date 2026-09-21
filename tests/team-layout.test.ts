import assert from "node:assert/strict";
import test from "node:test";
import { personSchema, initiativeSchema, type Plan } from "../lib/domain";
import { buildGraph, graphId } from "../lib/graph-model";
import { layoutTeamGraph } from "../lib/team-layout";

const person = (id: string, managerId: string | null, isLeader = false) =>
  personSchema.parse({
    id,
    managerId,
    isLeader,
    name: "Same name",
    craft: "design",
    fte: 1,
    nonProjectPct: 0,
  });
const project = (id: string, leadId: string | null, memberIds: string[] = []) =>
  initiativeSchema.parse({
    id,
    leadId,
    memberIds,
    name: "Same project",
    priority: "Shared priority",
    start: "2026-01-01",
    end: "2026-12-31",
    status: "committed",
    effort: { design: 1, research: 0, content: 0, design_eng: 0 },
  });
const fixture = (): Plan => ({
  revision: 0,
  people: [
    person("head", null, true),
    person("a", "head", true),
    person("b", "head", true),
    person("nested", "a", true),
    person("designer", "nested"),
    person("peer", "b"),
  ],
  initiatives: [
    project("shared", "designer", ["peer", "head"]),
    project("other", "b"),
    project("missing", null),
  ],
});
const graphFor = (plan: Plan) => buildGraph(plan, "2026-01-01", "2026-12-31");

test("groups by stable ownership IDs, preserving shared contributors without duplicate projects", () => {
  const plan = fixture();
  const graph = graphFor(plan);
  const result = layoutTeamGraph(graph, plan);
  const node = (kind: "person" | "project", id: string) =>
    result.nodes.find((n) => n.id === graphId(kind, id))!;
  assert.equal(node("person", "head").groupId, "team:head");
  assert.equal(node("person", "nested").groupId, "team:a");
  assert.equal(node("person", "designer").groupId, "team:a");
  assert.equal(node("project", "shared").groupId, "team:a");
  assert.equal(node("project", "other").groupId, "team:b");
  assert.equal(node("project", "missing").groupId, "unassigned");
  assert.equal(result.nodes.length, graph.nodes.length);
  assert.equal(new Set(result.nodes.map((n) => n.id)).size, graph.nodes.length);
  assert.equal(
    result.groups.reduce((sum, g) => sum + g.projectCount, 0),
    plan.initiatives.length,
  );
  assert.equal(
    result.groups.reduce((sum, g) => sum + g.peopleCount, 0),
    plan.people.length,
  );
  assert.equal(result.groups.find((g) => g.id === "team:a")!.peopleCount, 3);
  assert.equal(
    result.nodes.find((n) => n.kind === "priority")!.groupId,
    "priorities",
  );
});

test("scoped graphs use full hierarchy without adding hidden people or projects", () => {
  const plan = fixture();
  const graph = graphFor(plan);
  graph.nodes = graph.nodes.filter(
    (n) => n.recordId === "designer" || n.recordId === "shared",
  );
  const result = layoutTeamGraph(graph, plan);
  assert.equal(result.nodes.length, 2);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].leaderId, "a");
  assert.equal(result.groups[0].projectCount, 1);
  assert.equal(result.groups[0].peopleCount, 1);
});

test("reordering inputs and renaming people preserves positions without mutations", () => {
  const plan = fixture();
  const graph = graphFor(plan);
  const before = structuredClone({ plan, graph });
  const result = layoutTeamGraph(graph, plan);
  assert.deepEqual({ plan, graph }, before);
  assert.deepEqual(
    result,
    layoutTeamGraph(
      { nodes: [...graph.nodes].reverse(), links: [...graph.links].reverse() },
      {
        ...plan,
        people: [...plan.people].reverse(),
        initiatives: [...plan.initiatives].reverse(),
      },
    ),
  );
  const renamed = layoutTeamGraph(
    { ...graph, nodes: graph.nodes.map((n) => ({ ...n, label: n.id })) },
    {
      ...plan,
      people: plan.people.map((p) => ({ ...p, name: p.id })),
    },
  );
  assert.deepEqual(
    result.nodes.map(({ id, groupId, x, y }) => ({ id, groupId, x, y })),
    renamed.nodes.map(({ id, groupId, x, y }) => ({ id, groupId, x, y })),
  );
  for (const node of result.nodes) {
    const group = result.groups.find((g) => g.id === node.groupId)!;
    assert.ok(
      node.x - node.radius > group.x &&
        node.x + node.radius < group.x + group.width,
    );
    assert.ok(
      node.y - node.radius > group.y + 80 &&
        node.y + node.radius < group.y + group.height,
    );
  }
});

test("empty graph, missing owners, broken managers, and reporting cycles remain safe and explicit", () => {
  const plan = fixture();
  assert.deepEqual(layoutTeamGraph({ nodes: [], links: [] }, plan), {
    nodes: [],
    groups: [],
  });
  plan.people.find((p) => p.id === "a")!.managerId = "nested";
  plan.people.find((p) => p.id === "b")!.managerId = "not-found";
  plan.initiatives.push(project("bad-owner", "not-found"));
  const result = layoutTeamGraph(graphFor(plan), plan);
  for (const id of ["a", "nested", "designer", "b", "peer"])
    assert.equal(
      result.nodes.find((n) => n.id === graphId("person", id))!.groupId,
      "unassigned",
    );
  assert.equal(
    result.nodes.find((n) => n.recordId === "bad-owner")!.groupId,
    "unassigned",
  );
  assert.ok(
    result.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)),
  );
});

test("team rows align and projects occupy a separate band below people", () => {
  const plan = fixture();
  for (const columns of [1, 3] as const) {
    const result = layoutTeamGraph(graphFor(plan), plan, columns);
    for (const group of result.groups) {
      const peers = result.groups.filter(g => g.y === group.y);
      assert.ok(peers.every(g => g.height === group.height));
      const members = result.nodes.filter(n => n.groupId === group.id);
      const work = members.filter(n => n.kind === "project");
      const people = members.filter(n => n.kind !== "project");
      if (work.length && people.length)
        assert.ok(Math.min(...work.map(n => n.y)) > Math.max(...people.map(n => n.y)) + 100);
      assert.ok(members.every(n => n.x > group.x && n.x < group.x + group.width));
    }
  }
});

test("reporting root occupies the top-left cell regardless of ID order", () => {
  const plan = fixture();
  const result = layoutTeamGraph(graphFor(plan), plan);
  assert.equal(result.groups[0].leaderId, "head");
  assert.equal(result.groups[0].x, 0);
  assert.equal(result.groups[0].y, 0);
  const mobile = layoutTeamGraph(graphFor(plan), plan, 1);
  assert.equal(mobile.groups[0].leaderId, "head");
});

test("shared priorities occupy a full-width final row", () => {
  const plan = fixture();
  for (const columns of [1, 3] as const) {
    const result = layoutTeamGraph(graphFor(plan), plan, columns);
    const footer = result.groups.find(g => g.id === "priorities")!;
    const teams = result.groups.filter(g => g.id !== "priorities");
    assert.equal(footer.x, 0);
    assert.equal(footer.width, 500 * columns + 56 * (columns - 1));
    assert.ok(teams.every(g => g.y + g.height < footer.y));
  }
});

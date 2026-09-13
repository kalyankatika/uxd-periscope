import assert from "node:assert/strict";
import test from "node:test";
import type { GraphModel, GraphNode, GraphLink } from "../lib/graph-model";
import { fitGraph } from "../lib/graph-layout";
import { layoutReportingGraph } from "../lib/reporting-layout";

const person = (id: string, kind: GraphNode["kind"] = "person"): GraphNode => ({
  id,
  recordId: id,
  kind,
  label: "Same name",
  subtitle: "Designer",
  attention: false,
  top: false,
});
const reports = (
  source: string,
  target: string,
  kind: GraphLink["kind"] = "reports",
): GraphLink => ({ id: `${source}-${target}`, source, target, kind });
const organization = (): GraphModel => ({
  nodes: [
    person("head", "leader"),
    person("manager", "leader"),
    person("lead", "leader"),
    person("designer"),
    person("peer"),
    person("other-root"),
    person("other-report"),
  ],
  links: [
    reports("manager", "head"),
    reports("lead", "manager"),
    reports("designer", "lead"),
    reports("peer", "manager"),
    reports("other-report", "other-root"),
  ],
});

test("reporting forest preserves four levels, separates siblings, and fits the viewport", () => {
  const graph = organization();
  const positioned = layoutReportingGraph(graph);
  const byId = new Map(positioned.map((node) => [node.id, node]));
  for (const edge of graph.links)
    assert.ok(byId.get(edge.target)!.y < byId.get(edge.source)!.y);
  assert.equal(byId.get("head")!.y, byId.get("other-root")!.y);
  assert.equal(byId.get("lead")!.y, byId.get("peer")!.y);
  assert.ok(Math.abs(byId.get("lead")!.x - byId.get("peer")!.x) >= 200);
  assert.equal(byId.get("head")!.radius, 14);
  assert.equal(byId.get("designer")!.radius, 10);
  for (const a of positioned)
    for (const b of positioned) {
      if (a.id !== b.id)
        assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > a.radius + b.radius);
    }
  const camera = fitGraph(positioned, 1000, 650);
  for (const node of positioned) {
    assert.ok(camera.x + (node.x - node.radius) * camera.k >= 0);
    assert.ok(camera.x + (node.x + node.radius) * camera.k <= 1000);
    assert.ok(camera.y + (node.y - node.radius) * camera.k >= 0);
    assert.ok(camera.y + (node.y + node.radius) * camera.k <= 650);
  }
});

test("layout uses IDs despite duplicate names, is deterministic, and never mutates inputs", () => {
  const graph = organization();
  const before = structuredClone(graph);
  graph.nodes.forEach(Object.freeze);
  graph.links.forEach(Object.freeze);
  Object.freeze(graph.nodes);
  Object.freeze(graph.links);
  Object.freeze(graph);
  const result = layoutReportingGraph(graph);
  assert.deepEqual(graph, before);
  assert.equal(new Set(result.map((node) => node.id)).size, graph.nodes.length);
  assert.deepEqual(
    result,
    layoutReportingGraph({
      nodes: [...graph.nodes].reverse(),
      links: [...graph.links].reverse(),
    }),
  );
  const renamed = layoutReportingGraph({
    ...before,
    nodes: before.nodes.map((node) => ({
      ...node,
      label: node.id.toUpperCase(),
    })),
  });
  assert.deepEqual(
    result.map(({ id, x, y }) => ({ id, x, y })),
    renamed.map(({ id, x, y }) => ({ id, x, y })),
  );
});

test("empty, irrelevant, missing-endpoint and cyclic relationships are handled safely", () => {
  assert.deepEqual(layoutReportingGraph({ nodes: [], links: [] }), []);
  const graph: GraphModel = {
    nodes: [
      person("a"),
      person("b"),
      person("c"),
      person("project", "project"),
    ],
    links: [
      reports("a", "b"),
      reports("b", "c"),
      reports("c", "a"),
      reports("a", "missing"),
      reports("missing", "a"),
      reports("b", "b"),
      reports("project", "a"),
      reports("c", "project", "contributes"),
    ],
  };
  const positioned = layoutReportingGraph(graph);
  assert.deepEqual(
    positioned.map((node) => node.id),
    ["a", "b", "c"],
  );
  assert.ok(
    positioned.every(
      (node) => Number.isFinite(node.x) && Number.isFinite(node.y),
    ),
  );
  assert.equal(new Set(positioned.map((node) => node.y)).size, 3);
  assert.deepEqual(
    positioned,
    layoutReportingGraph({
      nodes: [...graph.nodes].reverse(),
      links: [...graph.links].reverse(),
    }),
  );
});

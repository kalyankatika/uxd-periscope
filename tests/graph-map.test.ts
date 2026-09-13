import { test } from "node:test";
import assert from "node:assert/strict";
import { leadershipDemo } from "../lib/leadership-demo";
import {
  reportingGraph,
  buildGraph,
  filterGraph,
  graphId,
  neighborhood,
  connectionLabel,
  type NodeKind,
} from "../lib/graph-model";
import { layoutGraph, fitGraph, zoomCamera } from "../lib/graph-layout";
import { workGraph } from "../lib/work-graph";

const allKinds: NodeKind[] = ["leader", "person", "project", "priority"];
const demo = leadershipDemo();
const graph = buildGraph(demo, "2026-10-01", "2026-12-31");

test("The visual map shares export identities and shows only recorded relationships", () => {
  const exported = new Set(workGraph(demo)["@graph"].map((n) => n["@id"]));
  assert.equal(graph.nodes.length, exported.size);
  for (const n of graph.nodes) assert.ok(exported.has(n.id));
  const elena = graphId("person", "elena"),
    maya = graphId("person", "maya"),
    opening = graphId("project", "opening");
  assert.ok(
    graph.links.some(
      (e) => e.source === maya && e.target === elena && e.kind === "reports",
    ),
  );
  assert.ok(
    graph.links.some(
      (e) => e.source === maya && e.target === opening && e.kind === "owns",
    ),
  );
  assert.ok(
    !graph.links.some((e) => e.source === elena && e.target === opening),
    "Do not invent direct ownership for a manager",
  );
  assert.equal(graph.links.length, new Set(graph.links.map((e) => e.id)).size);
  const ids = new Set(graph.nodes.map((n) => n.id));
  assert.ok(graph.links.every((e) => ids.has(e.source) && ids.has(e.target)));
});

test("Attention and top-priority spotlights retain contributors and their reporting chains", () => {
  const top = filterGraph(graph, { preset: "top", kinds: allKinds });
  assert.deepEqual(
    top.nodes
      .filter((n) => n.kind === "project")
      .map((n) => n.recordId)
      .sort(),
    ["advisor", "ai-standards", "experience-strategy", "opening", "retirement"],
  );
  assert.ok(top.nodes.some((n) => n.recordId === "maya"));
  assert.ok(top.nodes.some((n) => n.recordId === "elena"));
  assert.ok(top.nodes.some((n) => n.recordId === "uxd-head"));
  const attention = filterGraph(graph, {
    preset: "attention",
    kinds: allKinds,
  });
  assert.deepEqual(
    attention.nodes
      .filter((n) => n.kind === "project")
      .map((n) => n.recordId)
      .sort(),
    [
      "ai-research",
      "conversational-prototype",
      "mobile",
      "opening",
      "retirement",
    ],
  );
  const noPeople = filterGraph(graph, {
    preset: "all",
    kinds: ["project", "priority"],
  });
  assert.ok(
    noPeople.links.every((e) => e.kind === "supports" || e.kind === "depends"),
  );
  assert.deepEqual(filterGraph(graph, { preset: "all", kinds: [] }), {
    nodes: [],
    links: [],
  });
});

test("Local graph depth follows both directions, and explains each relationship from the selected item", () => {
  const elena = graphId("person", "elena"),
    maya = graphId("person", "maya"),
    opening = graphId("project", "opening");
  const one = neighborhood(graph, elena, 1),
    two = neighborhood(graph, elena, 2);
  assert.ok(one.has(maya));
  assert.ok(!one.has(opening));
  assert.ok(
    two.has(opening),
    "A leader's reports connect to their projects at two steps",
  );
  const local = filterGraph(graph, {
    preset: "all",
    kinds: allKinds,
    focusId: elena,
    depth: 2,
  });
  assert.ok(local.nodes.every((n) => two.has(n.id)));
  const owner = graph.links.find(
    (e) => e.source === maya && e.target === opening,
  )!;
  assert.equal(connectionLabel(owner, maya), "Owns project");
  assert.equal(connectionLabel(owner, opening), "Project owner");
  const dependency = graph.links.find((e) => e.kind === "depends")!;
  assert.equal(connectionLabel(dependency, dependency.source), "Depends on");
  assert.equal(connectionLabel(dependency, dependency.target), "Needed by");
  assert.equal(neighborhood(graph, "missing", 2).size, 0);
});

test("Quarter boundaries omit inactive projects without dangling dependencies", () => {
  const current = buildGraph(demo, "2026-12-01", "2026-12-31");
  assert.ok(
    !current.nodes.some(
      (n) => n.kind === "project" && n.recordId === "statements",
    ),
  );
  const ids = new Set(current.nodes.map((n) => n.id));
  assert.ok(current.links.every((e) => ids.has(e.source) && ids.has(e.target)));
  const emptyPeriod = buildGraph(demo, "2028-01-01", "2028-03-31");
  assert.ok(
    emptyPeriod.nodes.every((n) => n.kind === "leader" || n.kind === "person"),
  );
});

test("Force layout stays deterministic, separated and immutable; fit contains all nodes", () => {
  const before = structuredClone(graph);
  const nodes = layoutGraph(graph);
  assert.deepEqual(graph, before, "D3 must not mutate saved relationships");
  assert.deepEqual(nodes, layoutGraph(graph));
  for (const node of nodes) {
    assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
    for (const other of nodes)
      if (node.id !== other.id)
        assert.ok(
          Math.hypot(node.x - other.x, node.y - other.y) >
            node.radius + other.radius,
        );
  }
  for (const [width, height] of [
    [900, 660],
    [360, 540],
  ]) {
    const camera = fitGraph(nodes, width, height);
    for (const n of nodes) {
      assert.ok((n.x - n.radius) * camera.k + camera.x >= 0);
      assert.ok((n.x + n.radius) * camera.k + camera.x <= width);
      assert.ok((n.y - n.radius) * camera.k + camera.y >= 0);
      assert.ok((n.y + n.radius) * camera.k + camera.y <= height);
    }
  }
  assert.deepEqual(layoutGraph({ nodes: [], links: [] }), []);
  assert.deepEqual(fitGraph([], 600, 400), { x: 300, y: 200, k: 1 });
});

test("Zoom preserves the location under the pointer and clamps extreme input", () => {
  const camera = { x: 180, y: 220, k: 0.6 },
    anchor = { x: 400, y: 300 };
  for (const factor of [0.0001, 0.8, 1.2, 10000]) {
    const zoomed = zoomCamera(camera, factor, anchor);
    assert.ok(zoomed.k >= 0.05 && zoomed.k <= 4);
    assert.ok(
      Math.abs(
        (anchor.x - zoomed.x) / zoomed.k - (anchor.x - camera.x) / camera.k,
      ) < 0.000001,
    );
    assert.ok(
      Math.abs(
        (anchor.y - zoomed.y) / zoomed.k - (anchor.y - camera.y) / camera.k,
      ) < 0.000001,
    );
  }
});

test("Reporting view includes every descendant and excludes project connections and ancestors", () => {
  const before = JSON.stringify(graph);
  const full = reportingGraph(graph);
  assert.equal(full.nodes.length, 26);
  assert.equal(full.links.length, 25);
  const root = graphId("person", "elena");
  const subtree = reportingGraph(graph, root);
  assert.deepEqual(subtree.nodes.map((n) => n.recordId).sort(), [
    "elena",
    "jordan",
    "maya",
    "nina",
  ]);
  assert.equal(subtree.links.length, 3);
  assert.ok(
    subtree.links.some(
      (e) =>
        e.source === graphId("person", "nina") &&
        e.target === graphId("person", "maya"),
    ),
  );
  assert.equal(
    reportingGraph(graph, graphId("person", "uxd-head")).nodes.length,
    26,
  );
  assert.equal(reportingGraph(graph, "missing").nodes.length, 0);
  const filtered = filterGraph(graph, {
    preset: "reporting",
    kinds: allKinds,
    focusId: root,
    depth: 1,
  });
  assert.deepEqual(
    filtered,
    subtree,
    "Reporting focus must not truncate grandchildren at generic connection depth",
  );
  const leaders = filterGraph(graph, {
    preset: "reporting",
    kinds: ["leader"],
  });
  const ids = new Set(leaders.nodes.map((n) => n.id));
  assert.ok(leaders.links.every((e) => ids.has(e.source) && ids.has(e.target)));
  assert.equal(JSON.stringify(graph), before);
});

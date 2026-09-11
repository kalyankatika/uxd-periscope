import { test } from "node:test";
import assert from "node:assert/strict";
import { leadershipDemo } from "../lib/leadership-demo";
import { buildGraph, filterGraph, graphId } from "../lib/graph-model";
import { graphGridItems } from "../lib/graph-grid";

test("Grid cards preserve graph identities, filtered connections and search scope", () => {
  const plan = leadershipDemo();
  const graph = buildGraph(plan, "2026-10-01", "2026-12-31");
  const filtered = filterGraph(graph, {
    preset: "attention",
    kinds: ["project", "priority"],
  });
  const before = structuredClone(filtered);
  const cards = graphGridItems(plan, filtered, "", "connections");
  assert.deepEqual(
    new Set(cards.map((c) => c.node.id)),
    new Set(filtered.nodes.map((n) => n.id)),
  );
  assert.equal(
    cards.reduce((sum, c) => sum + c.connections, 0),
    filtered.links.length * 2,
  );
  assert.ok(
    cards.every((c, i) => i === 0 || cards[i - 1].connections >= c.connections),
  );
  assert.deepEqual(
    graphGridItems(plan, filtered, "UX AI interaction standards"),
    [],
    "Search cannot reintroduce a project excluded by the attention filter",
  );
  assert.equal(
    graphGridItems(plan, filtered, "  CONVERSATIONAL  ")[0].node.recordId,
    "conversational-prototype",
  );
  assert.deepEqual(filtered, before);
  assert.deepEqual(graphGridItems(plan, { nodes: [], links: [] }), []);
});

test("Grid owner labels use IDs and team project counts respect the selected period", () => {
  const plan = leadershipDemo();
  // A duplicate display name must not change the source identity of either card.
  const maya = plan.people.find((p) => p.id === "maya")!;
  const nina = plan.people.find((p) => p.id === "nina")!;
  nina.name = maya.name;
  const graph = buildGraph(plan, "2026-10-01", "2026-12-31");
  const cards = graphGridItems(plan, graph);
  const duplicates = cards.filter((c) => c.node.label === maya.name);
  assert.equal(duplicates.length, 2);
  assert.notEqual(duplicates[0].node.id, duplicates[1].node.id);
  const standards = cards.find(
    (c) => c.node.id === graphId("project", "ai-standards"),
  )!;
  assert.equal(standards.context, "Aisha Patel");
  assert.equal(standards.health, "On track");
  const december = {
    ...plan,
    initiatives: plan.initiatives.filter(
      (p) => p.start <= "2026-12-31" && p.end >= "2026-12-01",
    ),
  };
  const decemberCards = graphGridItems(
    december,
    buildGraph(december, "2026-12-01", "2026-12-31"),
  );
  assert.ok(!decemberCards.some((c) => c.node.recordId === "ai-standards"));
  assert.equal(
    decemberCards.find((c) => c.node.recordId === "riley")?.detail,
    "2 team projects",
  );
});

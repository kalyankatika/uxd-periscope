import test from "node:test";
import assert from "node:assert/strict";
import { graphTrail, visitGraphNode } from "../lib/graph-navigation";
const ids = new Set(["person:1", "person:2", "project:1"]);

test("graph navigation follows IDs and truncates when returning to an earlier node", () => {
  let trail = visitGraphNode([], "person:1", ids);
  trail = visitGraphNode(trail, "project:1", ids);
  trail = visitGraphNode(trail, "person:2", ids);
  assert.deepEqual(trail, ["person:1", "project:1", "person:2"]);
  assert.deepEqual(visitGraphNode(trail, trail[trail.length - 2], ids), [
    "person:1",
    "project:1",
  ]);
  assert.deepEqual(visitGraphNode(trail, "person:1", ids), ["person:1"]);
  assert.deepEqual(visitGraphNode(trail, "person:2", ids), trail);
});

test("graph navigation removes deleted nodes and rejects unknown destinations", () => {
  const trail = ["person:1", "deleted:1", "project:1"];
  assert.deepEqual(graphTrail(trail, ids), ["person:1", "project:1"]);
  assert.deepEqual(visitGraphNode(trail, "unknown", ids), [
    "person:1",
    "project:1",
  ]);
  assert.deepEqual(graphTrail(["deleted:1"], ids), []);
});

import type { GraphModel } from "./graph-model";
import type { PositionedNode } from "./graph-layout";

const compareIds = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const COLUMN_WIDTH = 220;
const ROW_HEIGHT = 150;

/** Reporting edges point from a report to their manager; render managers above reports. */
export function layoutReportingGraph(graph: GraphModel): PositionedNode[] {
  const nodes = graph.nodes
    .filter((node) => node.kind === "person" || node.kind === "leader")
    .slice()
    .sort((a, b) => compareIds(a.id, b.id));
  const ids = new Set(nodes.map((node) => node.id));
  const parents = new Map<string, string>();
  const edges = graph.links
    .filter(
      (edge) =>
        edge.kind === "reports" &&
        ids.has(edge.source) &&
        ids.has(edge.target) &&
        edge.source !== edge.target,
    )
    .slice()
    .sort(
      (a, b) =>
        compareIds(a.source, b.source) || compareIds(a.target, b.target),
    );
  // A valid organization has one manager per person. Defensive malformed input
  // chooses one by ID, independently of incoming array order.
  for (const edge of edges) {
    if (!parents.has(edge.source)) parents.set(edge.source, edge.target);
  }
  // Break cycles deterministically without recursion, so even malformed/deep
  // hierarchies yield a finite forest. Validation remains the importer's job.
  const checked = new Set<string>();
  for (const node of nodes) {
    const path = new Set<string>();
    let current: string | undefined = node.id;
    while (current !== undefined && !checked.has(current)) {
      if (path.has(current)) {
        parents.delete(current);
        break;
      }
      path.add(current);
      current = parents.get(current);
    }
    for (const id of path) checked.add(id);
  }
  const children = new Map<string, string[]>();
  const roots: string[] = [];
  for (const node of nodes) {
    const parent = parents.get(node.id);
    if (parent === undefined) roots.push(node.id);
    else children.set(parent, [...(children.get(parent) || []), node.id]);
  }
  const traversal: string[] = [];
  const stack = [...roots].reverse();
  while (stack.length) {
    const id = stack.pop()!;
    traversal.push(id);
    stack.push(...(children.get(id) || []).slice().reverse());
  }
  const widths = new Map<string, number>();
  for (const id of traversal.slice().reverse()) {
    widths.set(
      id,
      Math.max(
        COLUMN_WIDTH,
        (children.get(id) || []).reduce(
          (sum, child) => sum + widths.get(child)!,
          0,
        ),
      ),
    );
  }
  const totalWidth = roots.reduce((sum, id) => sum + widths.get(id)!, 0);
  const levelHeight = Math.max(ROW_HEIGHT, totalWidth * 0.16);
  const positions = new Map<string, { x: number; y: number }>();
  const leftEdges = new Map<string, number>();
  let rootLeft = -totalWidth / 2;
  for (const root of roots) {
    leftEdges.set(root, rootLeft);
    positions.set(root, { x: rootLeft + widths.get(root)! / 2, y: 0 });
    rootLeft += widths.get(root)!;
  }
  for (const id of traversal) {
    let left = leftEdges.get(id)!;
    for (const child of children.get(id) || []) {
      leftEdges.set(child, left);
      positions.set(child, {
        x: left + widths.get(child)! / 2,
        y: positions.get(id)!.y + levelHeight,
      });
      left += widths.get(child)!;
    }
  }
  return nodes.map((node) => ({
    ...node,
    ...positions.get(node.id)!,
    radius: node.kind === "leader" ? 14 : 10,
  }));
}

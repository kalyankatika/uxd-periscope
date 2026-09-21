import type { Plan } from "./domain";
import { buildGraph, type GraphModel, type GraphNode } from "./graph-model";
import type { TeamGroup, TeamPositionedNode } from "./team-layout";

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

/** Place each visible node once; priority membership is an explicit supports relationship. */
export function layoutPriorityGraph(graph: GraphModel, plan: Plan, columns: 1 | 3 = 3): {
  nodes: TeamPositionedNode[];
  groups: TeamGroup[];
} {
  // Retain priority context when a kind filter hides the priority node itself.
  const full = buildGraph(plan, "0000-01-01", "9999-12-31");
  const priorities = new Map([...full.nodes, ...graph.nodes]
    .filter(n => n.kind === "priority").map(n => [n.id, n]));
  const memberships = new Map<string, Set<string>>();
  for (const edge of [...full.links, ...graph.links]) {
    if (edge.kind !== "supports" || !priorities.has(edge.target)) continue;
    const targets = memberships.get(edge.source) || new Set<string>();
    targets.add(edge.target);
    memberships.set(edge.source, targets);
  }
  const buckets = new Map<string, { priority?: GraphNode; nodes: GraphNode[] }>();
  for (const node of [...graph.nodes].sort((a, b) => compare(a.id, b.id))) {
    const targets = memberships.get(node.id);
    const priorityId = node.kind === "priority" ? node.id
      : node.kind === "project" && targets?.size === 1 ? [...targets][0] : undefined;
    const id = priorityId ? `priority:${priorityId}`
      : node.kind === "project" ? "unaligned" : "people";
    const bucket = buckets.get(id) || { priority: priorityId ? priorities.get(priorityId) : undefined, nodes: [] };
    bucket.nodes.push(node);
    buckets.set(id, bucket);
  }
  const entries = [...buckets.entries()].sort(([a, ab], [b, bb]) => {
    const rank = (id: string) => id === "people" ? 2 : id === "unaligned" ? 1 : 0;
    return rank(a) - rank(b) || compare(ab.priority?.label || a, bb.priority?.label || b) || compare(a, b);
  });
  const nodes: TeamPositionedNode[] = [];
  const groups: TeamGroup[] = [];
  const width = 500, cellWidth = 150, cellHeight = 105;
  let y = 0;
  const priorityEntries = entries.filter(([id]) => id !== "people");
  for (let row = 0; row < priorityEntries.length; row += columns) {
    const rowEntries = priorityEntries.slice(row, row + columns);
    const contextRows = Math.max(...rowEntries.map(([, b]) => Math.ceil(b.nodes.filter(n => n.kind !== "project").length / 3)));
    const projectRows = Math.max(...rowEntries.map(([, b]) => Math.ceil(b.nodes.filter(n => n.kind === "project").length / 3)));
    const projectOffset = 130 + contextRows * cellHeight + 35;
    const height = projectRows ? projectOffset + projectRows * cellHeight : 130 + contextRows * cellHeight;
    rowEntries.forEach(([id, bucket], column) => {
      const x = column * (width + 56);
      const projects = bucket.nodes.filter(n => n.kind === "project");
      groups.push({
        id, label: bucket.priority?.label || (id === "people" ? "People" : "Unaligned work"),
        subtitle: bucket.priority ? "Business priority" : id === "people" ? "Select a person to see related work" : "No single priority relationship",
        x, y, width, height,
        ...(projects.length ? { projectY: y + projectOffset - 35 } : {}),
        projectCount: projects.length,
        peopleCount: bucket.nodes.filter(n => n.kind === "leader" || n.kind === "person").length,
      });
      [bucket.nodes.filter(n => n.kind !== "project"), projects].forEach((section, sectionIndex) => {
        section.forEach((node, index) => {
          const rowCount = Math.min(3, section.length - Math.floor(index / 3) * 3);
          nodes.push({ ...node, groupId: id,
            x: x + width / 2 + ((index % 3) - (rowCount - 1) / 2) * cellWidth,
            y: y + (sectionIndex ? projectOffset : 130) + Math.floor(index / 3) * cellHeight,
            radius: node.kind === "project" ? 12 : node.kind === "priority" ? 13 : node.kind === "leader" ? 11 : 8,
          });
        });
      });
    });
    y += height + 56;
  }
  const people = buckets.get("people")?.nodes;
  if (people?.length) {
    const nodeColumns = columns * 3;
    const peopleWidth = width * columns + 56 * (columns - 1);
    const height = 130 + Math.ceil(people.length / nodeColumns) * cellHeight;
    groups.push({ id: "people", label: "People", subtitle: "Select a person to see related work",
      x: 0, y, width: peopleWidth, height, projectCount: 0, peopleCount: people.length });
    people.forEach((node, index) => {
      const rowCount = Math.min(nodeColumns, people.length - Math.floor(index / nodeColumns) * nodeColumns);
      nodes.push({ ...node, groupId: "people",
        x: peopleWidth / 2 + ((index % nodeColumns) - (rowCount - 1) / 2) * cellWidth,
        y: y + 130 + Math.floor(index / nodeColumns) * cellHeight,
        radius: node.kind === "leader" ? 11 : 8 });
    });
  }
  return { nodes, groups };
}

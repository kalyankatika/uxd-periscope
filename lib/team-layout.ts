import type { Plan } from "./domain";
import type { GraphModel } from "./graph-model";
import type { PositionedNode } from "./graph-layout";

export type TeamGroup = {
  id: string;
  leaderId?: string;
  label: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  projectCount: number;
  peopleCount: number;
};
export type TeamPositionedNode = PositionedNode & { groupId: string };

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Reorganize the visible graph only; ownership comes from the full reporting hierarchy. */
export function layoutTeamGraph(
  graph: GraphModel,
  plan: Plan,
  columns: 1 | 3 = 3,
): {
  nodes: TeamPositionedNode[];
  groups: TeamGroup[];
} {
  const people = new Map(plan.people.map((p) => [p.id, p]));
  const projects = new Map(plan.initiatives.map((p) => [p.id, p]));
  const managerIds = new Set(plan.people.map((p) => p.managerId));
  const ownerGroups = new Map<string, string>();
  function groupOwner(id: string | null): string | undefined {
    if (!id || !people.has(id)) return undefined;
    if (ownerGroups.has(id)) return ownerGroups.get(id);
    const chain: string[] = [];
    const seen = new Set<string>();
    let current: string | null = id;
    while (current && people.has(current)) {
      // Invalid hierarchy is grouped explicitly instead of inventing a reporting root.
      if (seen.has(current)) return undefined;
      seen.add(current);
      chain.push(current);
      current = people.get(current)!.managerId;
    }
    if (current) return undefined;
    const root = chain[chain.length - 1];
    const belowRoot = chain.slice(0, -1).reverse();
    const owner =
      belowRoot.find(
        (personId) =>
          people.get(personId)!.isLeader || managerIds.has(personId),
      ) || root;
    ownerGroups.set(id, owner);
    return owner;
  }

  const buckets = new Map<
    string,
    { leaderId?: string; nodes: GraphModel["nodes"] }
  >();
  for (const node of [...graph.nodes].sort((a, b) => compare(a.id, b.id))) {
    const leaderId =
      node.kind === "priority"
        ? undefined
        : groupOwner(
            node.kind === "project"
              ? (projects.get(node.recordId)?.leadId ?? null)
              : node.recordId,
          );
    const id =
      node.kind === "priority"
        ? "priorities"
        : leaderId
          ? `team:${leaderId}`
          : "unassigned";
    const bucket = buckets.get(id) || { leaderId, nodes: [] };
    bucket.nodes.push(node);
    buckets.set(id, bucket);
  }
  const entries = [...buckets.entries()].sort(([a], [b]) => {
    const rank = (id: string) =>
      id === "priorities" ? 2 : id === "unassigned" ? 1 : 0;
    return rank(a) - rank(b) || compare(a, b);
  });
  const nodes: TeamPositionedNode[] = [];
  const groups: TeamGroup[] = [];
  const cellWidth = 150;
  const cellHeight = 105;
  const width = 500;
  let y = 0;
  for (let row = 0; row < entries.length; row += columns) {
    const rowEntries = entries.slice(row, row + columns);
    let rowHeight = 0;
    rowEntries.forEach(([id, bucket], column) => {
      const x = column * (width + 40);
      const height = 105 + Math.ceil(bucket.nodes.length / 3) * cellHeight;
      rowHeight = Math.max(rowHeight, height);
      const leader = bucket.leaderId ? people.get(bucket.leaderId) : undefined;
      groups.push({
        id,
        ...(leader ? { leaderId: leader.id } : {}),
        label:
          leader?.name || (id === "priorities" ? "Priorities" : "Unassigned"),
        subtitle: leader
          ? leader.managerId
            ? leader.team || leader.title
            : "Leadership"
          : id === "priorities"
            ? "Shared across teams"
            : "No assigned group",
        x,
        y,
        width,
        height,
        projectCount: bucket.nodes.filter((n) => n.kind === "project").length,
        peopleCount: bucket.nodes.filter(
          (n) => n.kind === "leader" || n.kind === "person",
        ).length,
      });
      bucket.nodes.forEach((node, index) =>
        nodes.push({
          ...node,
          groupId: id,
          x: x + 100 + (index % 3) * cellWidth,
          y: y + 110 + Math.floor(index / 3) * cellHeight,
          radius:
            node.kind === "project"
              ? 12
              : node.kind === "priority"
                ? 13
                : node.kind === "leader"
                  ? 11
                  : 8,
        }),
      );
    });
    y += rowHeight + 40;
  }
  return { nodes, groups };
}

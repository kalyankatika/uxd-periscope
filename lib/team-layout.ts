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
  projectY?: number;
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
  const entries = [...buckets.entries()].sort(([a, aBucket], [b, bBucket]) => {
    const rank = (id: string, leaderId?: string) => {
      if (id === "priorities") return 3;
      if (id === "unassigned") return 2;
      const leader = leaderId ? people.get(leaderId) : undefined;
      return leader && !leader.managerId ? 0 : 1;
    };
    return rank(a, aBucket.leaderId) - rank(b, bBucket.leaderId) || compare(a, b);
  });
  const nodes: TeamPositionedNode[] = [];
  const groups: TeamGroup[] = [];
  const cellWidth = 150;
  const cellHeight = 105;
  const width = 500;
  let y = 0;
  const teamEntries = entries.filter(([id]) => id !== "priorities");
  for (let row = 0; row < teamEntries.length; row += columns) {
    const rowEntries = teamEntries.slice(row, row + columns);
    const peopleRows = Math.max(...rowEntries.map(([, b]) =>
      Math.ceil(b.nodes.filter(n => n.kind !== "project").length / 3)));
    const projectRows = Math.max(...rowEntries.map(([, b]) =>
      Math.ceil(b.nodes.filter(n => n.kind === "project").length / 3)));
    const projectOffset = 130 + peopleRows * cellHeight + 35;
    const rowHeight = projectRows
      ? projectOffset + projectRows * cellHeight
      : 130 + peopleRows * cellHeight;
    rowEntries.forEach(([id, bucket], column) => {
      const x = column * (width + 56);
      const height = rowHeight;
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
        ...(bucket.nodes.some(n => n.kind === "project")
          ? { projectY: y + projectOffset - 35 } : {}),
        projectCount: bucket.nodes.filter((n) => n.kind === "project").length,
        peopleCount: bucket.nodes.filter(
          (n) => n.kind === "leader" || n.kind === "person",
        ).length,
      });
      const sections = [
        bucket.nodes.filter(n => n.kind !== "project").sort((a, b) =>
          Number(b.recordId === bucket.leaderId) - Number(a.recordId === bucket.leaderId)
          || Number(b.kind === "leader") - Number(a.kind === "leader")
          || compare(a.id, b.id)),
        bucket.nodes.filter(n => n.kind === "project"),
      ];
      sections.forEach((section, sectionIndex) => section.forEach((node, index) => {
        const rowStart = Math.floor(index / 3) * 3;
        const rowCount = Math.min(3, section.length - rowStart);
        nodes.push({
          ...node,
          groupId: id,
          x: x + width / 2 + ((index % 3) - (rowCount - 1) / 2) * cellWidth,
          y: y + (sectionIndex ? projectOffset : 130) + Math.floor(index / 3) * cellHeight,
          radius: node.kind === "project" ? 12 : node.kind === "priority" ? 13 : node.kind === "leader" ? 11 : 8,
        });
      }));

    });
    y += rowHeight + 56;
  }
  const priorities = buckets.get("priorities")?.nodes;
  if (priorities?.length) {
    const nodeColumns = columns * 3;
    const fullWidth = width * columns + 56 * (columns - 1);
    groups.push({ id: "priorities", label: "Priorities", subtitle: "Shared across teams",
      x: 0, y, width: fullWidth, height: 130 + Math.ceil(priorities.length / nodeColumns) * cellHeight,
      projectCount: 0, peopleCount: 0 });
    priorities.forEach((node, index) => {
      const rowCount = Math.min(nodeColumns, priorities.length - Math.floor(index / nodeColumns) * nodeColumns);
      nodes.push({ ...node, groupId: "priorities",
        x: fullWidth / 2 + ((index % nodeColumns) - (rowCount - 1) / 2) * cellWidth,
        y: y + 130 + Math.floor(index / nodeColumns) * cellHeight, radius: 13 });
    });
  }
  return { nodes, groups };
}

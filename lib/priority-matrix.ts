import type { Plan } from "./domain";
import type { GraphNode } from "./graph-model";
import { layoutTeamGraph } from "./team-layout";

export type PriorityMatrixColumn = { id: string; label: string };
export type PriorityMatrixRow = {
  id: string;
  label: string;
  subtitle: string;
  cells: { priorityId: string; projects: GraphNode[] }[];
};

/** Counts only projects already in view; ownership matches the By team map. */
export function buildPriorityMatrix(nodes: GraphNode[], plan: Plan) {
  const projects = [
    ...new Map(
      nodes.filter((n) => n.kind === "project").map((n) => [n.id, n]),
    ).values(),
  ];
  const records = new Map(plan.initiatives.map((p) => [p.id, p]));
  const priorityOf = (node: GraphNode) =>
    records.get(node.recordId)?.priority || "";
  const names = [...new Set(projects.map(priorityOf))].sort((a, b) =>
    a ? (b ? a.localeCompare(b) : -1) : 1,
  );
  const columns: PriorityMatrixColumn[] = names.map((name) => ({
    id: name ? `priority:${name}` : "unaligned",
    label: name || "Unaligned work",
  }));
  const layout = layoutTeamGraph({ nodes: projects, links: [] }, plan);
  const rows: PriorityMatrixRow[] = layout.groups.map((group) => ({
    id: group.id,
    label: group.label,
    subtitle: group.subtitle,
    cells: columns.map((column) => ({
      priorityId: column.id,
      projects: layout.nodes
        .filter(
          (node) =>
            node.groupId === group.id &&
            (priorityOf(node)
              ? `priority:${priorityOf(node)}`
              : "unaligned") === column.id,
        )
        .sort(
          (a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id),
        ),
    })),
  }));
  return { rows, columns, projectCount: projects.length };
}

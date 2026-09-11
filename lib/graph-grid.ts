import type { Plan } from "./domain";
import type { GraphModel, GraphNode } from "./graph-model";
import { healthLabels, leaderProjects } from "./work-graph";

export type GridSort = "type" | "name" | "connections";
export type GraphGridItem = {
  node: GraphNode;
  contextLabel: string;
  context: string;
  description: string;
  detail: string;
  health?: string;
  connections: number;
};

// The caller supplies the same period and filtered graph used by the map.
export function graphGridItems(
  plan: Plan,
  graph: GraphModel,
  query = "",
  sort: GridSort = "type",
): GraphGridItem[] {
  const people = new Map(plan.people.map((p) => [p.id, p]));
  const projects = new Map(plan.initiatives.map((p) => [p.id, p]));
  const connections = new Map<string, number>();
  for (const link of graph.links) {
    connections.set(link.source, (connections.get(link.source) || 0) + 1);
    connections.set(link.target, (connections.get(link.target) || 0) + 1);
  }
  const term = query.trim().toLowerCase();
  const items = graph.nodes
    .filter((n) => `${n.label} ${n.subtitle}`.toLowerCase().includes(term))
    .map((node): GraphGridItem => {
      const base = { node, connections: connections.get(node.id) || 0 };
      if (node.kind === "project") {
        const project = projects.get(node.recordId)!;
        const owner = project.leadId ? people.get(project.leadId) : null;
        return {
          ...base,
          contextLabel: "Owner",
          context: owner?.name || "Unassigned",
          description: project.priority || "No business priority assigned",
          detail: `Due ${new Date(project.end + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`,
          health:
            project.delivery === "completed"
              ? "Completed"
              : project.delivery === "blocked"
                ? "Blocked"
                : healthLabels[project.health],
        };
      }
      if (node.kind === "priority") {
        const supporting = plan.initiatives.filter(
          (p) => p.priority === node.recordId,
        );
        return {
          ...base,
          contextLabel: "Projects",
          context: `${supporting.length} supporting ${supporting.length === 1 ? "project" : "projects"}`,
          description: supporting.map((p) => p.name).join(" · "),
          detail: "Business priority",
        };
      }
      const person = people.get(node.recordId)!;
      const count = leaderProjects(plan, person.id).length;
      return {
        ...base,
        contextLabel: "Team",
        context: person.team || "Unassigned",
        description: person.title || "Team member",
        detail: `${count} ${node.kind === "leader" ? "team" : "related"} ${count === 1 ? "project" : "projects"}`,
      };
    });
  const order = { project: 0, leader: 1, priority: 2, person: 3 };
  return items.sort((a, b) => {
    const primary =
      sort === "type"
        ? order[a.node.kind] - order[b.node.kind]
        : sort === "connections"
          ? b.connections - a.connections
          : 0;
    return (
      primary ||
      a.node.label.localeCompare(b.node.label, "en") ||
      a.node.id.localeCompare(b.node.id, "en")
    );
  });
}

import type { Plan } from "./domain";
import { graphId, type GraphModel } from "./graph-model";
import { leaderProjects, teamIds } from "./work-graph";

/** A person scope includes their full reporting subtree and its work, not a
 * fixed number of graph hops. Connected projects never pull in unrelated work. */
export function scopeGraph(
  graph: GraphModel,
  plan: Plan,
  selectedId: string | null,
): GraphModel {
  const selected = graph.nodes.find((node) => node.id === selectedId);
  if (!selected) return graph;
  const ids = new Set([selected.id]);
  const projects = new Set<string>();
  if (selected.kind === "person" || selected.kind === "leader") {
    for (const id of teamIds(plan.people, selected.recordId))
      ids.add(graphId("person", id));
    for (const project of leaderProjects(plan, selected.recordId))
      projects.add(graphId("project", project.id));
  } else if (selected.kind === "project") {
    projects.add(selected.id);
  } else {
    for (const edge of graph.links)
      if (edge.kind === "supports" && edge.target === selected.id)
        projects.add(edge.source);
  }
  const primaryProjects = new Set(selected.kind === "project" ? projects : []);
  for (const edge of graph.links) {
    if (edge.kind !== "depends") continue;
    if (primaryProjects.has(edge.source)) projects.add(edge.target);
    if (primaryProjects.has(edge.target)) projects.add(edge.source);
  }
  for (const id of projects) ids.add(id);
  for (const edge of graph.links) {
    if (
      (edge.kind === "owns" || edge.kind === "contributes") &&
      projects.has(edge.target)
    )
      ids.add(edge.source);
    if (edge.kind === "supports" && projects.has(edge.source))
      ids.add(edge.target);
  }
  return {
    nodes: graph.nodes.filter((node) => ids.has(node.id)),
    links: graph.links.filter(
      (edge) => ids.has(edge.source) && ids.has(edge.target),
    ),
  };
}

import type { Plan } from "./domain";
import { leaders } from "./work-graph";

export type NodeKind = "leader" | "person" | "project" | "priority";
export type LinkKind =
  "reports" | "owns" | "contributes" | "supports" | "depends";
export type GraphNode = {
  id: string;
  recordId: string;
  label: string;
  kind: NodeKind;
  subtitle: string;
  attention: boolean;
  top: boolean;
};
export type GraphLink = {
  id: string;
  source: string;
  target: string;
  kind: LinkKind;
};
export type GraphModel = { nodes: GraphNode[]; links: GraphLink[] };
export const graphId = (kind: "person" | "project" | "priority", id: string) =>
  `urn:periscope:${kind}:${encodeURIComponent(id)}`;

/** The visual map uses the same identities and explicit relationships as JSON-LD. */
export function buildGraph(plan: Plan, start: string, end: string): GraphModel {
  const projects = plan.initiatives.filter(
    (p) => p.start <= end && p.end >= start,
  );
  const leaderIds = new Set(leaders(plan.people).map((p) => p.id));
  const nodes: GraphNode[] = [
    ...plan.people.map((p): GraphNode => ({
      id: graphId("person", p.id),
      recordId: p.id,
      label: p.name,
      kind: leaderIds.has(p.id) ? "leader" : "person",
      subtitle: p.title || p.team || "Team member",
      attention: false,
      top: false,
    })),
    ...projects.map((p): GraphNode => ({
      id: graphId("project", p.id),
      recordId: p.id,
      label: p.name,
      kind: "project",
      subtitle: p.summary || "Project",
      attention:
        p.delivery !== "completed" &&
        (p.health === "needs_decision" ||
          p.health === "at_risk" ||
          p.delivery === "blocked"),
      top: p.importance === "top" && p.delivery !== "completed",
    })),
    ...[...new Set(projects.map((p) => p.priority).filter(Boolean))].map(
      (name): GraphNode => ({
        id: graphId("priority", name),
        recordId: name,
        label: name,
        kind: "priority",
        subtitle: "Business priority",
        attention: false,
        top: false,
      }),
    ),
  ];
  const ids = new Set(nodes.map((n) => n.id));
  const links = new Map<string, GraphLink>();
  function link(source: string, target: string, kind: LinkKind) {
    if (!ids.has(source) || !ids.has(target)) return;
    const id = `${kind}:${source}:${target}`;
    links.set(id, { id, source, target, kind });
  }
  for (const p of plan.people)
    if (p.managerId)
      link(graphId("person", p.id), graphId("person", p.managerId), "reports");
  for (const p of projects) {
    const id = graphId("project", p.id);
    if (p.leadId) link(graphId("person", p.leadId), id, "owns");
    for (const member of p.memberIds)
      if (member !== p.leadId)
        link(graphId("person", member), id, "contributes");
    if (p.priority) link(id, graphId("priority", p.priority), "supports");
    for (const dependency of p.dependsOn)
      link(id, graphId("project", dependency), "depends");
  }
  return { nodes, links: [...links.values()] };
}

export function neighborhood(
  graph: GraphModel,
  id: string,
  depth = 1,
): Set<string> {
  if (!graph.nodes.some((n) => n.id === id)) return new Set();
  const found = new Set([id]);
  for (let i = 0; i < depth; i++) {
    const previous = new Set(found);
    for (const edge of graph.links) {
      if (previous.has(edge.source)) found.add(edge.target);
      if (previous.has(edge.target)) found.add(edge.source);
    }
  }
  return found;
}

export type GraphPreset = "all" | "top" | "attention";
export function filterGraph(
  graph: GraphModel,
  options: {
    preset: GraphPreset;
    kinds: NodeKind[];
    focusId?: string | null;
    depth?: number;
  },
): GraphModel {
  let ids = new Set(graph.nodes.map((n) => n.id));
  if (options.preset !== "all") {
    const projects = graph.nodes.filter(
      (n) =>
        n.kind === "project" &&
        (options.preset === "top" ? n.top : n.attention),
    );
    ids = new Set(projects.map((n) => n.id));
    // Include the selected work's people, business priorities, and management chain.
    for (const edge of graph.links) {
      if (edge.kind === "owns" || edge.kind === "contributes") {
        if (ids.has(edge.target)) ids.add(edge.source);
      }
      if (edge.kind === "supports" && ids.has(edge.source))
        ids.add(edge.target);
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of graph.links)
        if (
          edge.kind === "reports" &&
          ids.has(edge.source) &&
          !ids.has(edge.target)
        ) {
          ids.add(edge.target);
          changed = true;
        }
    }
  }
  if (options.focusId) {
    const local = neighborhood(graph, options.focusId, options.depth ?? 1);
    ids = new Set([...ids].filter((id) => local.has(id)));
  }
  const nodes = graph.nodes.filter(
    (n) => ids.has(n.id) && options.kinds.includes(n.kind),
  );
  const visible = new Set(nodes.map((n) => n.id));
  return {
    nodes,
    links: graph.links.filter(
      (e) => visible.has(e.source) && visible.has(e.target),
    ),
  };
}

export function connectionLabel(edge: GraphLink, from: string) {
  const forward = edge.source === from;
  return {
    reports: forward ? "Reports to" : "Direct report",
    owns: forward ? "Owns project" : "Project owner",
    contributes: forward ? "Contributes to" : "Contributor",
    supports: forward
      ? "Supports this priority"
      : "Project supporting this priority",
    depends: forward ? "Depends on" : "Needed by",
  }[edge.kind];
}

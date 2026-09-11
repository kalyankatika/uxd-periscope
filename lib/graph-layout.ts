import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
import type { GraphModel, GraphNode } from "./graph-model";

export type PositionedNode = GraphNode & {
  x: number;
  y: number;
  radius: number;
};
type Particle = PositionedNode & SimulationNodeDatum;
export type Camera = { x: number; y: number; k: number };

/** Run on copies: D3 mutates particles and link endpoints. Saved records stay intact. */
export function layoutGraph(graph: GraphModel): PositionedNode[] {
  const counts = new Map<string, number>();
  for (const l of graph.links) {
    counts.set(l.source, (counts.get(l.source) || 0) + 1);
    counts.set(l.target, (counts.get(l.target) || 0) + 1);
  }
  const nodes: Particle[] = [...graph.nodes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((n, i) => {
      const angle = i * 2.399963229728653;
      return {
        ...n,
        x: Math.cos(angle) * Math.sqrt(i + 1) * 55,
        y: Math.sin(angle) * Math.sqrt(i + 1) * 55,
        radius:
          (n.kind === "project"
            ? 10
            : n.kind === "priority"
              ? 11
              : n.kind === "leader"
                ? 9
                : 5) + Math.min(5, Math.sqrt(counts.get(n.id) || 0)),
      };
    });
  if (!nodes.length) return [];
  const simulation = forceSimulation(nodes)
    .stop()
    .force(
      "link",
      forceLink<Particle, { source: string; target: string; kind: string }>(
        graph.links.map((e) => ({ ...e })),
      )
        .id((n) => n.id)
        .distance((l) => (l.kind === "reports" ? 105 : 150))
        .strength(0.22),
    )
    .force("charge", forceManyBody<Particle>().strength(-800))
    .force(
      "collide",
      forceCollide<Particle>()
        .radius((n) => (n.kind === "person" ? 45 : 66))
        .iterations(3),
    )
    .force("x", forceX<Particle>().strength(0.035))
    .force("y", forceY<Particle>().strength(0.06));
  simulation.tick(220);
  return nodes.map(
    ({
      id,
      recordId,
      label,
      kind,
      subtitle,
      attention,
      top,
      x,
      y,
      radius,
    }) => ({
      id,
      recordId,
      label,
      kind,
      subtitle,
      attention,
      top,
      // Normalize insignificant runtime floating-point differences for SSR hydration.
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      radius: Math.round(radius * 1000) / 1000,
    }),
  );
}

export function fitGraph(
  nodes: Pick<PositionedNode, "x" | "y" | "radius">[],
  width: number,
  height: number,
): Camera {
  if (!nodes.length || width <= 0 || height <= 0)
    return { x: width / 2, y: height / 2, k: 1 };
  const minX = Math.min(...nodes.map((n) => n.x - n.radius)),
    maxX = Math.max(...nodes.map((n) => n.x + n.radius));
  const minY = Math.min(...nodes.map((n) => n.y - n.radius)),
    maxY = Math.max(...nodes.map((n) => n.y + n.radius));
  const k = Math.max(
    0.05,
    Math.min(
      1.3,
      Math.max(40, width - 160) / Math.max(1, maxX - minX),
      Math.max(40, height - 130) / Math.max(1, maxY - minY),
    ),
  );
  return {
    k,
    x: width / 2 - ((minX + maxX) / 2) * k,
    y: height / 2 - ((minY + maxY) / 2) * k,
  };
}

export function zoomCamera(
  camera: Camera,
  factor: number,
  anchor: { x: number; y: number },
): Camera {
  const k = Math.max(0.05, Math.min(4, camera.k * factor));
  return {
    k,
    x: anchor.x - ((anchor.x - camera.x) * k) / camera.k,
    y: anchor.y - ((anchor.y - camera.y) * k) / camera.k,
  };
}

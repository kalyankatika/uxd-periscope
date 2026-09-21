import type { TeamGroup, TeamPositionedNode } from "./team-layout";

/** Fill the canvas horizontally without cropping the desktop overview vertically. */
export function fillGroupWidth(layout: {nodes: TeamPositionedNode[]; groups: TeamGroup[]}, width: number, height: number) {
  if (!layout.groups.length || width < 550) return layout;
  const right = Math.max(...layout.groups.map(g => g.x + g.width));
  const bottom = Math.max(...layout.groups.map(g => g.y + g.height));
  const k = Math.max(.01, Math.min(1, (width - 32) / right, Math.max(100, height - 190) / bottom));
  const stretch = (width - 32) / (right * k);
  return {
    nodes: layout.nodes.map(n => ({...n, x: n.x * stretch})),
    groups: layout.groups.map(g => ({...g, x: g.x * stretch, width: g.width * stretch})),
  };
}

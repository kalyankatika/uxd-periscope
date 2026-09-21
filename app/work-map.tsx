"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Initiative, Plan } from "@/lib/domain";
import WorkGrid from "./work-grid";
import { scopeGraph } from "@/lib/graph-scope";
import { layoutTeamGraph } from "@/lib/team-layout";
import { graphTrail, visitGraphNode } from "@/lib/graph-navigation";
import { layoutReportingGraph } from "@/lib/reporting-layout";
import UiIcon from "./ui-icon";
import { graphGridItems, type GridSort } from "@/lib/graph-grid";
import {
  buildGraph,
  connectionLabel,
  filterGraph,
  graphId,
  neighborhood,
  type GraphNode,
  type GraphPreset,
  type NodeKind,
} from "@/lib/graph-model";
import {
  fitGraph,
  layoutGraph,
  zoomCamera,
  type Camera,
} from "@/lib/graph-layout";
import {
  deliveryLabels,
  healthLabels,
  leaderProjects,
  teamIds,
} from "@/lib/work-graph";

const kinds: NodeKind[] = ["priority", "project", "leader", "person"];
const kindLabels: Record<NodeKind, string> = {
  priority: "Priorities",
  project: "Projects",
  leader: "Leaders",
  person: "People",
};
const singular: Record<NodeKind, string> = {
  priority: "Business priority",
  project: "Project",
  leader: "Leader",
  person: "Team member",
};
const colors: Record<NodeKind, string> = {
  priority: "#c4a6ff",
  project: "#8ed575",
  leader: "#f1c577",
  person: "#80bce8",
};
const letters = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
const date = (value: string) =>
  new Date(value + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function labelLines(text: string): string[] {
  if (text.length <= 23) return [text];
  const words = text.split(" ");
  let line = "";
  while (words.length && (line + " " + words[0]).trim().length <= 23)
    line = (line + " " + words.shift()).trim();
  if (!line) return [text.slice(0, 21) + "…"];
  const rest = words.join(" ");
  return [line, rest.length > 25 ? rest.slice(0, 23) + "…" : rest];
}

export default function WorkMap({
  plan,
  start,
  end,
  initialProjectId,
  onProject,
  onPerson,
  onAddReport,
  onExport,
}: {
  plan: Plan;
  start: string;
  end: string;
  initialProjectId?: string;
  onProject: (p: Initiative) => void;
  onPerson: (id: string) => void;
  onAddReport?: (id: string) => void;
  onExport: () => void;
}) {
  const [trail, setTrail] = useState<string[]>(() =>
    initialProjectId ? [graphId("project", initialProjectId)] : [],
  );
  const [lastProjectRequest, setLastProjectRequest] =
    useState(initialProjectId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<GraphPreset>("all");
  const [visibleKinds, setVisibleKinds] = useState<NodeKind[]>(kinds);
  const [local, setLocal] = useState(Boolean(initialProjectId));
  const [labels, setLabels] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [mapLayout, setMapLayout] = useState<"network" | "team">("network");
  const [gridSort, setGridSort] = useState<GridSort>("type");
  const [cameraOverride, setCamera] = useState<Camera | null>(null);
  const [size, setSize] = useState({ width: 900, height: 650 });
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [listOpen, setListOpen] = useState(false);
  const browseButtonRef = useRef<HTMLButtonElement>(null);
  const listCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (listOpen) listCloseRef.current?.focus();
  }, [listOpen]);
  function closeList() {
    setListOpen(false);
    browseButtonRef.current?.focus();
  }
  const svg = useRef<SVGSVGElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const drag = useRef<{
    pointer: number;
    nodeId: string | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    camera: Camera;
  } | null>(null);
  const dotsId = useId().replaceAll(":", "");
  const graph = useMemo(() => buildGraph(plan, start, end), [plan, start, end]);
  const graphIds = useMemo(
    () => new Set(graph.nodes.map((node) => node.id)),
    [graph],
  );
  // Consume an explicit drawer navigation request without remounting the map.
  // Guarding on the previous prop prevents effects from reselecting after edits.
  if (initialProjectId !== lastProjectRequest) {
    setLastProjectRequest(initialProjectId);
    const id = initialProjectId ? graphId("project", initialProjectId) : null;
    if (id && graphIds.has(id)) {
      setTrail((previous) => visitGraphNode(previous, id, graphIds));
      setLocal(true);
      setPreset("all");
      setVisibleKinds(kinds);
      setQuery("");
      setHoveredId(null);
      setCamera(null);
      setViewMode("map");
    }
  }
  const currentTrail = graphTrail(trail, graphIds);
  const effectiveSelectedId = currentTrail.at(-1) ?? null;
  const selected = graph.nodes.find((node) => node.id === effectiveSelectedId);
  const scopeLabel = selected
    ? `${selected.label} · ${selected.kind === "person" || selected.kind === "leader" ? (preset === "reporting" ? "reporting group" : "team and projects") : "related work"}`
    : "Whole organization";
  const workScope = useMemo(
    () => scopeGraph(graph, plan, selected?.id ?? null),
    [graph, plan, selected],
  );
  const scopedGraph = useMemo(
    () =>
      preset === "reporting"
        ? filterGraph(graph, { preset, kinds, focusId: selected?.id })
        : workScope,
    [graph, workScope, preset, selected],
  );
  const visible = useMemo(
    () => filterGraph(scopedGraph, { preset, kinds: visibleKinds }),
    [scopedGraph, preset, visibleKinds],
  );
  const workLayout = useMemo(() => layoutGraph(graph), [graph]);
  const teamLayout = useMemo(
    () => layoutTeamGraph(visible, plan, size.width < 550 ? 1 : 3),
    [visible, plan, size.width],
  );
  const byTeam = mapLayout === "team" && preset !== "reporting";
  const layout = useMemo(
    () =>
      preset === "reporting"
        ? layoutReportingGraph(visible)
        : byTeam
          ? teamLayout.nodes
          : workLayout,
    [preset, visible, byTeam, teamLayout, workLayout],
  );
  const teamByNode = useMemo(
    () => new Map(teamLayout.nodes.map((n) => [n.id, n.groupId])),
    [teamLayout],
  );
  const visibleIds = useMemo(
    () => new Set(visible.nodes.map((n) => n.id)),
    [visible.nodes],
  );
  const nodes = useMemo(
    () =>
      layout
        .filter((n) => visibleIds.has(n.id))
        .map((n) => ({ ...n, ...(!byTeam ? positions[n.id] : {}) })),
    [layout, visibleIds, positions, byTeam],
  );
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const allNodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes],
  );
  const fitted = useMemo(
    () =>
      byTeam && size.width < 550
        ? { x: 20, y: 110, k: Math.max(0.2, (size.width - 40) / 500) }
        : fitGraph(
            byTeam
              ? teamLayout.groups.flatMap((g) => [
                  { x: g.x, y: g.y, radius: 0 },
                  { x: g.x + g.width, y: g.y + g.height, radius: 0 },
                ])
              : nodes,
            size.width,
            size.height,
          ),
    [nodes, size, byTeam, teamLayout],
  );
  const camera = cameraOverride || fitted;
  const cameraRef = useRef(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);
  const highlighted =
    hoveredId || (selected && visibleIds.has(selected.id) ? selected.id : null);
  const neighbors = useMemo(
    () => (highlighted ? neighborhood(visible, highlighted) : null),
    [visible, highlighted],
  );
  const matches = useMemo(
    () =>
      query.trim()
        ? graph.nodes.filter((n) =>
            `${n.label} ${n.subtitle}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
          )
        : [],
    [graph.nodes, query],
  );
  const matchIds = new Set(matches.map((n) => n.id));
  const project =
    selected?.kind === "project"
      ? plan.initiatives.find((p) => p.id === selected.recordId)
      : undefined;
  const person =
    selected && (selected.kind === "person" || selected.kind === "leader")
      ? plan.people.find((p) => p.id === selected.recordId)
      : undefined;
  const directReports = person
    ? plan.people.filter((p) => p.managerId === person.id)
    : [];
  const reportIds = person
    ? teamIds(plan.people, person.id)
    : new Set<string>();
  const indirectReports = person
    ? plan.people.filter(
        (p) =>
          p.id !== person.id &&
          reportIds.has(p.id) &&
          p.managerId !== person.id,
      )
    : [];
  const manager = person
    ? plan.people.find((p) => p.id === person.managerId)
    : undefined;
  const periodPlan = useMemo(
    () => ({
      ...plan,
      initiatives: plan.initiatives.filter(
        (p) => p.start <= end && p.end >= start,
      ),
    }),
    [plan, start, end],
  );
  const selectedProjects = person
    ? leaderProjects(periodPlan, person.id)
    : selected?.kind === "priority"
      ? periodPlan.initiatives.filter((p) => p.priority === selected.recordId)
      : [];
  const gridItems = useMemo(
    () => graphGridItems(periodPlan, visible, query, gridSort),
    [periodPlan, visible, query, gridSort],
  );
  const directLinks = selected
    ? graph.links.filter(
        (e) => e.source === selected.id || e.target === selected.id,
      )
    : [];
  const topProjects = workScope.nodes.filter(
    (n) => n.kind === "project" && n.top,
  );
  const projectCount = scopedGraph.nodes.filter(
    (n) => n.kind === "project",
  ).length;
  const attentionCount = workScope.nodes.filter((n) => n.attention).length;

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    let lastWidth = 0;
    let lastHeight = 0;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      setSize({ width, height });
      setCamera(null);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    function wheel(e: WheelEvent) {
      if (!element) return;
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      setCamera(
        zoomCamera(
          cameraRef.current,
          Math.exp(-Math.max(-100, Math.min(100, e.deltaY)) * 0.004),
          { x: e.clientX - rect.left, y: e.clientY - rect.top },
        ),
      );
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [viewMode]);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [expanded]);

  function selectNode(id: string, _reveal = false) {
    if (listOpen) closeList();
    if (!allNodeMap.has(id)) return;

    setTrail((previous) => visitGraphNode(previous, id, graphIds));
    panel.current?.querySelector(".map-inspector")?.scrollTo({ top: 0 });
    setHoveredId(null);
    setLocal(true);
    const reportingPerson =
      preset === "reporting" &&
      ["person", "leader"].includes(allNodeMap.get(id)?.kind || "");
    if (!reportingPerson) setPreset("all");
    setVisibleKinds(kinds);
    setQuery("");
    setCamera(null);
    if (preset === "reporting") setPositions({});
  }
  function reset() {
    setTrail([]);
    setHoveredId(null);
    setQuery("");
    setPreset("all");
    setVisibleKinds(kinds);
    setLocal(false);
    setCamera(null);
    setPositions({});
  }
  function changePreset(value: GraphPreset) {
    setPreset(value);
    setVisibleKinds(kinds);
    setPositions({});
    if (
      value === "reporting" &&
      selected &&
      !["person", "leader"].includes(selected.kind)
    ) {
      setTrail([]);
      setLocal(false);
    }
    setHoveredId(null);
    setQuery("");
    setCamera(null);
  }
  function changeView(value: "map" | "grid") {
    setViewMode(value);
    setHoveredId(null);
    setListOpen(false);
  }
  function zoom(factor: number) {
    setCamera(
      zoomCamera(camera, factor, { x: size.width / 2, y: size.height / 2 }),
    );
  }
  function pointerDown(
    e: ReactPointerEvent<SVGSVGElement>,
    nodeId: string | null,
  ) {
    if (e.button !== 0 || drag.current) return;
    const node = nodeId ? nodeMap.get(nodeId) : null;
    drag.current = {
      pointer: e.pointerId,
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      originX: node?.x || 0,
      originY: node?.y || 0,
      moved: false,
      camera,
    };
    setCamera(camera);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const dx = e.clientX - d.startX,
      dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    setHoveredId(null);
    if (d.nodeId && !byTeam)
      setPositions((previous) => ({
        ...previous,
        [d.nodeId!]: {
          x: d.originX + dx / d.camera.k,
          y: d.originY + dy / d.camera.k,
        },
      }));
    else setCamera({ ...d.camera, x: d.camera.x + dx, y: d.camera.y + dy });
  }
  function pointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    if (!d.moved) {
      if (d.nodeId) selectNode(d.nodeId);
    }
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function nodeButton(node: GraphNode, caption?: string) {
    return (
      <button
        key={node.id}
        className="map-related-item"
        onClick={() => selectNode(node.id, true)}
      >
        <span className={`map-mini-node ${node.kind}`} aria-hidden="true">
          {node.kind === "project" ? (
            <UiIcon name="diamond" className="action-icon" />
          ) : node.kind === "priority" ? (
            <UiIcon name="target" className="action-icon" />
          ) : (
            letters(node.label)
          )}
        </span>
        <span>
          <strong>{node.label}</strong>
          <small>{caption || singular[node.kind]}</small>
        </span>
        <span aria-hidden="true">
          <UiIcon name="arrowUpRight" className="action-icon" />
        </span>
      </button>
    );
  }

  return (
    <section
      ref={panel}
      className={`work-map ${expanded ? "map-expanded" : ""}`}
      aria-label="Interactive work map"
      onKeyDown={(e) => {
        if (!expanded || e.key !== "Tab") return;
        const focusable = [
          ...(panel.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input, select, summary, [tabindex="0"]',
          ) || []),
        ].filter((el) => el.getClientRects().length);
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
    >
      {selected && (
        <nav className="map-context" aria-label="Work map context">
          <button
            aria-label="Back in work map"
            onClick={() =>
              currentTrail.length > 1
                ? selectNode(currentTrail[currentTrail.length - 2])
                : reset()
            }
          >
            <UiIcon name="arrowLeft" className="action-icon" /> Back
          </button>
          <span>
            Viewing: <strong>{scopeLabel}</strong>
          </span>
          <button onClick={reset}>Whole organization</button>
        </nav>
      )}
      <div className="map-heading">
        <div>
          <p>
            {projectCount} projects <span>·</span>{" "}
            {
              scopedGraph.nodes.filter(
                (n) => n.kind === "person" || n.kind === "leader",
              ).length
            }{" "}
            {selected && preset !== "reporting" ? "linked people" : "people"}{" "}
            <span>·</span>{" "}
            {scopedGraph.nodes.filter((n) => n.kind === "priority").length}{" "}
            priorities
          </p>
        </div>
        <div className="map-heading-actions">
          {viewMode === "map" && preset !== "reporting" && (
            <label className="map-layout-select">
              Layout
              <span className="map-layout-input">
              <select
                aria-label="Map layout"
                value={mapLayout}
                onChange={(e) => {
                  setMapLayout(e.target.value as "network" | "team");
                  setCamera(null);
                  setHoveredId(null);
                  setPositions({});
                }}
              >
                <option value="network">Network</option>
                <option value="team">By team</option>
              </select>
              <UiIcon name="chevronDown" className="map-layout-arrow" />
              </span>
            </label>
          )}
          <div className="map-view-switch" role="group" aria-label="Work view">
            <button
              aria-pressed={viewMode === "map"}
              onClick={() => changeView("map")}
            >
              <UiIcon name="connections" className="map-view-icon" /> Map
            </button>
            <button
              aria-pressed={viewMode === "grid"}
              onClick={() => changeView("grid")}
            >
              <UiIcon name="compare" className="map-view-icon" /> Grid
            </button>
          </div>
          <button
            aria-label="Export connected data"
            title="Export connected data"
            onClick={onExport}
          >
            <UiIcon name="download" className="action-icon" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={
              expanded ? `Exit expanded ${viewMode}` : `Expand ${viewMode}`
            }
            title={
              expanded ? `Exit expanded ${viewMode}` : `Expand ${viewMode}`
            }
          >
            <UiIcon
              name={expanded ? "collapse" : "expand"}
              className="action-icon"
            />
          </button>
        </div>
      </div>
      <div className="map-toolbar">
        <div className="map-search">
          <span aria-hidden="true">
            <UiIcon name="search" className="action-icon" />
          </span>
          <input
            aria-label="Search people, projects or priorities"
            placeholder="Search people, projects or priorities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
              const first =
                viewMode === "grid" ? gridItems[0]?.node : matches[0];
              if (e.key === "Enter" && first)
                selectNode(first.id, viewMode === "map");
            }}
          />
          {query && (
            <button aria-label="Clear map search" onClick={() => setQuery("")}>
              <UiIcon name="close" className="action-icon" />
            </button>
          )}
          {query.trim() && viewMode === "map" && (
            <div className="map-search-results">
              <p role="status">
                {matches.length
                  ? `${matches.length} matching items`
                  : "No matching people, projects or priorities"}
              </p>
              {matches.slice(0, 8).map((n) => nodeButton(n))}
              {matches.length > 8 && (
                <small>Refine your search to see fewer results.</small>
              )}
            </div>
          )}
        </div>
        <div className="map-presets" role="group" aria-label="Map filter">
          <button
            aria-pressed={preset === "all"}
            onClick={() => changePreset("all")}
          >
            All work
          </button>
          <button
            aria-pressed={preset === "reporting"}
            onClick={() => changePreset("reporting")}
          >
            Reporting lines
          </button>
          <button
            aria-pressed={preset === "top"}
            onClick={() => changePreset("top")}
          >
            Top priorities <span>{topProjects.length}</span>
          </button>
          <button
            aria-pressed={preset === "attention"}
            onClick={() => changePreset("attention")}
          >
            Needs attention <span>{attentionCount}</span>
          </button>
        </div>
      </div>
      <div className="map-body">
        <div
          className={`map-canvas ${viewMode === "grid" ? "map-grid-canvas" : ""}`}
          ref={wrapper}
        >
          <div
            className="map-legend"
            role="group"
            aria-label="Show or hide node types"
          >
            {(preset === "reporting" ? [] : kinds).map((kind) => (
              <button
                key={kind}
                aria-pressed={visibleKinds.includes(kind)}
                onClick={() => {
                  setVisibleKinds((previous) =>
                    previous.includes(kind)
                      ? previous.filter((k) => k !== kind)
                      : [...previous, kind],
                  );
                  setCamera(null);
                }}
              >
                <i style={{ background: colors[kind] }} />
                {kindLabels[kind]}
              </button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <WorkGrid
              items={gridItems}
              total={visible.nodes.length}
              selectedId={effectiveSelectedId}
              sort={gridSort}
              onSort={setGridSort}
              onSelect={selectNode}
              onReset={reset}
            />
          ) : (
            <>
              <svg
                ref={svg}
                width="100%"
                height="100%"
                viewBox={`0 0 ${size.width} ${size.height}`}
                role="group"
                aria-label="Knowledge graph. Select an item to view its connections."
                aria-describedby={`${dotsId}-help`}
                tabIndex={0}
                onPointerDown={(e) => {
                  const target = (e.target as Element).closest(
                    "[data-node-id]",
                  );
                  pointerDown(e, target?.getAttribute("data-node-id") || null);
                }}
                onPointerMove={pointerMove}
                onPointerUp={pointerUp}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onLostPointerCapture={() => {
                  drag.current = null;
                }}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "+",
                      "=",
                      "-",
                      "0",
                      "Escape",
                    ].includes(e.key)
                  )
                    e.preventDefault();
                  const delta = e.shiftKey ? 100 : 40;
                  if (e.key.startsWith("Arrow"))
                    setCamera({
                      ...camera,
                      x:
                        camera.x +
                        (e.key === "ArrowLeft"
                          ? delta
                          : e.key === "ArrowRight"
                            ? -delta
                            : 0),
                      y:
                        camera.y +
                        (e.key === "ArrowUp"
                          ? delta
                          : e.key === "ArrowDown"
                            ? -delta
                            : 0),
                    });
                  if (e.key === "+" || e.key === "=") zoom(1.2);
                  if (e.key === "-") zoom(1 / 1.2);
                  if (e.key === "0") setCamera(null);
                  if (e.key === "Escape") {
                    setTrail([]);
                    setLocal(false);
                  }
                }}
              >
                <defs>
                  <pattern
                    id={dotsId}
                    width="25"
                    height="25"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1" cy="1" r="0.7" fill="#354840" />
                  </pattern>
                </defs>
                <rect
                  width={size.width}
                  height={size.height}
                  fill={`url(#${dotsId})`}
                  opacity="0.65"
                />
                <g
                  transform={`translate(${camera.x},${camera.y}) scale(${camera.k})`}
                >
                  {byTeam &&
                    teamLayout.groups.map((group) => {
                      const compact = camera.k < 0.6;
                      const count =
                        group.id === "priorities"
                          ? `${teamLayout.nodes.filter((n) => n.groupId === group.id).length} shared priorities`
                          : `${group.projectCount} ${group.projectCount === 1 ? "project" : "projects"} · ${group.peopleCount} ${group.peopleCount === 1 ? "person" : "people"}`;
                      const zoomGroup = () => {
                        const fit = fitGraph(
                          [
                            { x: group.x, y: group.y, radius: 0 },
                            {
                              x: group.x + group.width,
                              y: group.y + group.height,
                              radius: 0,
                            },
                          ],
                          size.width,
                          size.height,
                        );
                        const k = Math.max(0.6, fit.k);
                        setCamera({
                          k,
                          x: size.width / 2 - (group.x + group.width / 2) * k,
                          y: size.height / 2 - (group.y + group.height / 2) * k,
                        });
                      };
                      const title = compact
                        ? group.label.slice(
                            0,
                            Math.max(
                              8,
                              Math.floor((group.width * camera.k) / 7) - 3,
                            ),
                          ) +
                          (group.label.length >
                          Math.max(
                            8,
                            Math.floor((group.width * camera.k) / 7) - 3,
                          )
                            ? "…"
                            : "")
                        : group.label;
                      return (
                        <g key={group.id} className="map-team-group">
                          <rect
                            x={group.x}
                            y={group.y}
                            width={group.width}
                            height={group.height}
                            rx="18"
                            fill="#203b2b"
                            fillOpacity="0.75"
                            stroke="#587c5e"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <g
                            role="button"
                            tabIndex={0}
                            aria-label={`Zoom to group: ${group.label}`}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={zoomGroup}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                zoomGroup();
                              }
                            }}
                          >
                            <title>
                              {group.label} · {group.subtitle} · {count}. Zoom
                              to group.
                            </title>
                            <rect
                              x={group.x}
                              y={group.y}
                              width={group.width}
                              height={compact ? group.height : 76}
                              rx="18"
                              fill="#294633"
                            />
                            <text
                              x={group.x + (compact ? 10 / camera.k : 18)}
                              y={group.y + (compact ? 24 / camera.k : 29)}
                              fill="#f1f7ef"
                              fontSize={compact ? 12 / camera.k : 22}
                              fontWeight="700"
                            >
                              {title}
                            </text>
                            <text
                              x={group.x + (compact ? 10 / camera.k : 18)}
                              y={group.y + (compact ? 42 / camera.k : 55)}
                              fill="#bdd0bc"
                              fontSize={compact ? 10 / camera.k : 17}
                            >
                              {count}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  {!(byTeam && camera.k < 0.6) &&
                    visible.links.map((edge) => {
                      const source = nodeMap.get(edge.source),
                        target = nodeMap.get(edge.target);
                      if (!source || !target) return null;
                      const crossTeam =
                        byTeam &&
                        teamByNode.get(edge.source) !==
                          teamByNode.get(edge.target);
                      if (
                        crossTeam &&
                        ![edge.source, edge.target].includes(highlighted || "")
                      )
                        return null;
                      const active =
                        highlighted === edge.source ||
                        highlighted === edge.target;
                      const opacity =
                        preset === "reporting"
                          ? active
                            ? 0.95
                            : 0.65
                          : hoveredId
                            ? active
                              ? 0.9
                              : 0.08
                            : query.trim()
                              ? matchIds.has(edge.source) ||
                                matchIds.has(edge.target)
                                ? 0.85
                                : 0.08
                              : 0.4;
                      return (
                        <line
                          key={edge.id}
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          className={`map-edge ${active ? "active" : ""}`}
                          stroke={
                            active
                              ? colors[
                                  (highlighted === source.id ? target : source)
                                    .kind
                                ]
                              : edge.kind === "depends"
                                ? "#b69ca1"
                                : "#678174"
                          }
                          strokeWidth={
                            active
                              ? 1.8
                              : edge.kind === "contributes"
                                ? 0.8
                                : 1.1
                          }
                          strokeDasharray={
                            edge.kind === "reports"
                              ? preset === "reporting"
                                ? undefined
                                : "3 5"
                              : edge.kind === "depends"
                                ? "7 4"
                                : undefined
                          }
                          opacity={opacity}
                          vectorEffect="non-scaling-stroke"
                        >
                          <title>{`${source.label} — ${connectionLabel(edge, source.id).toLowerCase()} — ${target.label}`}</title>
                        </line>
                      );
                    })}
                  {nodes.map((positionedNode) => {
                    const node =
                      preset === "reporting"
                        ? {
                            ...positionedNode,
                            radius: Math.max(
                              positionedNode.radius,
                              6 / camera.k,
                            ),
                          }
                        : positionedNode;
                    const active = highlighted === node.id;
                    const connected = neighbors?.has(node.id);
                    const dim =
                      preset === "reporting"
                        ? false
                        : hoveredId
                          ? !connected
                          : !!query.trim() && !matchIds.has(node.id);
                    const showLabel =
                      (byTeam && camera.k > 0.6) ||
                      (preset === "reporting" && nodes.length <= 12) ||
                      labels ||
                      active ||
                      connected ||
                      (query.trim() && matchIds.has(node.id)) ||
                      node.kind !== "person" ||
                      camera.k > 1.25;
                    const lines = labelLines(node.label);
                    return (
                      <g
                        key={node.id}
                        data-node-id={node.id}
                        transform={`translate(${node.x},${node.y})`}
                        role="button"
                        tabIndex={0}
                        aria-label={`${singular[node.kind]}: ${node.label}${node.attention ? ", needs attention" : ""}. Show connections.`}
                        aria-pressed={effectiveSelectedId === node.id}
                        className={`map-node ${node.kind} ${active ? "is-active" : ""}`}
                        style={{
                          opacity: dim ? 0.16 : 1,
                          visibility:
                            byTeam && camera.k < 0.6 ? "hidden" : "visible",
                        }}
                        onMouseEnter={() => {
                          if (!drag.current) setHoveredId(node.id);
                        }}
                        onMouseLeave={() => setHoveredId(null)}
                        onFocus={() => setHoveredId(node.id)}
                        onBlur={() => setHoveredId(null)}
                        onClick={(e) => {
                          if (e.detail === 0) selectNode(node.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            selectNode(node.id);
                          }
                        }}
                      >
                        <title>{`${node.label} · ${singular[node.kind]}`}</title>
                        <circle
                          r={Math.max(node.radius + 10, 22 / camera.k)}
                          fill="transparent"
                        />
                        {(active || node.top) && (
                          <circle
                            className="node-halo"
                            r={node.radius + (active ? 12 : 7)}
                            fill={colors[node.kind]}
                            opacity={active ? 0.13 : 0.06}
                          />
                        )}
                        {active && (
                          <circle
                            r={node.radius + 5}
                            fill="none"
                            stroke={colors[node.kind]}
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}
                        <circle
                          r={node.radius}
                          fill={colors[node.kind]}
                          fillOpacity={
                            active || node.kind === "project" ? 1 : 0.82
                          }
                          stroke={colors[node.kind]}
                          strokeWidth={node.kind === "priority" ? 2 : 1}
                        />
                        {node.kind === "priority" && (
                          <circle r={node.radius * 0.46} fill="#15231c" />
                        )}
                        {node.kind === "leader" && (
                          <text
                            textAnchor="middle"
                            dy="0.35em"
                            fill="#342c1c"
                            fontSize="9"
                            fontWeight="700"
                            pointerEvents="none"
                          >
                            {letters(node.label)}
                          </text>
                        )}
                        {node.attention && (
                          <g
                            transform={`translate(${node.radius * 0.8},${-node.radius * 0.8})`}
                          >
                            <circle
                              r="5.5"
                              fill="#efad78"
                              stroke="#17241e"
                              strokeWidth="2"
                            />
                            <text
                              y="0.5"
                              dy="0.3em"
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="700"
                              fill="#302419"
                            >
                              !
                            </text>
                          </g>
                        )}
                        {showLabel && (
                          <g
                            transform={`translate(0,${node.radius + 16 / camera.k}) scale(${byTeam ? Math.min(1 / camera.k, 1.35) : 1 / camera.k})`}
                            pointerEvents="none"
                          >
                            <text
                              className="map-node-label"
                              textAnchor="middle"
                              fill={
                                active
                                  ? "#ffffff"
                                  : node.kind === "person"
                                    ? "#a9c8dd"
                                    : "#dfebe2"
                              }
                              fontSize={active ? "13" : "12"}
                              fontWeight={
                                node.kind === "project" || active
                                  ? "700"
                                  : "400"
                              }
                            >
                              {lines.map((line, i) => (
                                <tspan key={i} x="0" dy={i === 0 ? 0 : 15}>
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
              {!nodes.length && (
                <div className="map-empty">
                  <span aria-hidden="true">
                    <UiIcon name="target" className="action-icon" />
                  </span>
                  <h3>
                    {projectCount
                      ? "No items in this view"
                      : "No projects available"}
                  </h3>
                  <p>
                    {projectCount
                      ? "Change the project filter or enable a node type."
                      : "Add projects, then assign owners, contributors, and priorities."}
                  </p>
                  <button onClick={reset}>Reset map</button>
                </div>
              )}
              <div className="map-canvas-topline">
                <span>
                  {byTeam
                    ? "By accountable leader · Select group to zoom"
                    : preset === "reporting"
                      ? local && selected
                        ? `Reporting group: ${selected.label}`
                        : "Reporting lines · Select a leader to inspect their reports"
                      : local && selected
                        ? scopeLabel
                        : preset === "top"
                          ? "Top-priority projects"
                          : preset === "attention"
                            ? "Projects requiring attention"
                            : "All relationships"}
                </span>
                {!selected && preset !== "all" && (
                  <button onClick={reset}>
                    Whole organization{" "}
                    <UiIcon name="close" className="action-icon" />
                  </button>
                )}
              </div>
              <div className="map-canvas-bottom">
                <div className="map-view-controls">
                  <button
                    title="Zoom in (+)"
                    aria-label="Zoom in"
                    onClick={() => zoom(1.2)}
                  >
                    <UiIcon name="plus" className="action-icon" />
                  </button>
                  <button
                    title="Zoom out (-)"
                    aria-label="Zoom out"
                    onClick={() => zoom(1 / 1.2)}
                  >
                    <UiIcon name="minus" className="action-icon" />
                  </button>
                  <button title="Fit map (0)" onClick={() => setCamera(null)}>
                    Fit
                  </button>
                  <span>{Math.round(camera.k * 100)}%</span>
                </div>
                <div className="map-display-controls">
                  <button
                    aria-pressed={labels}
                    onClick={() => setLabels(!labels)}
                  >
                    All labels
                  </button>
                  <button
                    ref={browseButtonRef}
                    aria-controls={`${dotsId}-list`}
                    aria-expanded={listOpen}
                    onClick={() => setListOpen(!listOpen)}
                  >
                    Browse list
                  </button>
                </div>
              </div>
              {listOpen && (
                <div id={`${dotsId}-list`} className="map-accessible-list"
                  role="region" aria-label="Map items"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      closeList();
                    }
                  }}>
                  <div className="map-list-heading">
                    <h3>Map items</h3>
                    <button ref={listCloseRef} aria-label="Close map items" onClick={closeList}>
                      <UiIcon name="close" className="action-icon" />
                    </button>
                  </div>
                  <p>Select an item to view its details and connections.</p>
                  <div>{visible.nodes.map((n) => nodeButton(n))}</div>
                </div>
              )}
              <p id={`${dotsId}-help`} className="map-help">
                Drag to pan · Scroll to zoom · Select an item for details
              </p>
            </>
          )}
        </div>
        <aside
          className="map-inspector"
          aria-label="Selected item details"
          aria-live="polite"
        >
          {selected ? (
            <>
              <div className="map-inspector-top">
                <span className={`map-kind-tag ${selected.kind}`}>
                  {singular[selected.kind]}
                </span>
                <button
                  aria-label="Clear selected item"
                  onClick={() => {
                    setTrail([]);
                    setLocal(false);
                    setHoveredId(null);
                    setCamera(null);
                  }}
                >
                  <UiIcon name="close" className="action-icon" />
                </button>
              </div>
              <h3>{selected.label}</h3>
              <p className="map-inspector-description">{selected.subtitle}</p>
              {viewMode === "grid" && (
                <button
                  className="map-open-button"
                  onClick={() => changeView("map")}
                >
                  View on map{" "}
                  <span aria-hidden="true">
                    <UiIcon name="arrowUpRight" className="action-icon" />
                  </span>
                </button>
              )}
              {!visibleIds.has(selected.id) && (
                <p className="map-filter-note">
                  Hidden by the current filters.{" "}
                  <button onClick={() => selectNode(selected.id, true)}>
                    Show item
                  </button>
                </p>
              )}
              {project && (
                <>
                  <div className="map-project-status">
                    <span className={selected.attention ? "attention" : ""}>
                      {project.delivery === "completed"
                        ? "Completed"
                        : project.delivery === "blocked"
                          ? "Blocked"
                          : healthLabels[project.health]}
                    </span>
                    <small>Due {date(project.end)}</small>
                  </div>
                  {project.decision && (
                    <div className="map-decision">
                      <strong>Action required</strong>
                      <p>{project.decision}</p>
                    </div>
                  )}
                  {project.update && (
                    <p className="map-update">
                      <strong>Latest update</strong>
                      {project.update}
                    </p>
                  )}
                  <button
                    className="primary map-open-button"
                    onClick={() => {
                      setExpanded(false);
                      onProject(project);
                    }}
                  >
                    Open project details{" "}
                    <span aria-hidden="true">
                      <UiIcon name="arrowUpRight" className="action-icon" />
                    </span>
                  </button>
                </>
              )}
              {person && (
                <>
                  <div className="map-person-stats reporting-stats">
                    <div>
                      <strong>{directReports.length}</strong>
                      <span>direct reports</span>
                    </div>
                    <div>
                      <strong>{indirectReports.length}</strong>
                      <span>indirect reports</span>
                    </div>
                    <div>
                      <strong>{selectedProjects.length}</strong>
                      <span>related projects</span>
                    </div>
                  </div>
                  <div className="map-detail-section reporting-details">
                    <h4>Reports to</h4>
                    {manager ? (
                      nodeButton(
                        allNodeMap.get(graphId("person", manager.id))!,
                        manager.title || "Manager",
                      )
                    ) : (
                      <p className="map-inspector-description">
                        No manager in this workspace.
                      </p>
                    )}
                    <button
                      className="map-open-button"
                      onClick={() => {
                        setPreset("reporting");
                        setVisibleKinds(kinds);
                        setLocal(true);
                        setQuery("");
                        setCamera(null);
                        setPositions({});
                      }}
                    >
                      Show reporting group
                    </button>
                    <h4>
                      Direct reports <span>{directReports.length}</span>
                    </h4>
                    {directReports.map((report) =>
                      nodeButton(
                        allNodeMap.get(graphId("person", report.id))!,
                        `${plan.people.filter((p) => p.managerId === report.id).length} direct ${plan.people.filter((p) => p.managerId === report.id).length === 1 ? "report" : "reports"} · ${report.title || report.team}`,
                      ),
                    )}
                    {!directReports.length && (
                      <p className="map-inspector-description">
                        No direct reports recorded.
                      </p>
                    )}
                    {indirectReports.length > 0 && (
                      <details>
                        <summary>
                          Indirect reports ({indirectReports.length})
                        </summary>
                        {indirectReports.map((report) =>
                          nodeButton(
                            allNodeMap.get(graphId("person", report.id))!,
                            `Reports to ${plan.people.find((p) => p.id === report.managerId)?.name || "unassigned"}`,
                          ),
                        )}
                      </details>
                    )}
                  </div>
                  <button
                    className="primary map-open-button"
                    onClick={() => {
                      setExpanded(false);
                      onPerson(person.id);
                    }}
                  >
                    Edit person{" "}
                    <span aria-hidden="true">
                      <UiIcon name="arrowUpRight" className="action-icon" />
                    </span>
                  </button>
                  {onAddReport && (
                    <button
                      className="map-open-button"
                      onClick={() => {
                        setExpanded(false);
                        onAddReport(person.id);
                      }}
                    >
                      <UiIcon name="plus" className="action-icon" /> Add direct
                      report
                    </button>
                  )}
                </>
              )}
              {selected.kind === "priority" && (
                <div className="map-person-stats">
                  <div>
                    <strong>{selectedProjects.length}</strong>
                    <span>supporting projects</span>
                  </div>
                  <div>
                    <strong>
                      {
                        selectedProjects.filter(
                          (p) => p.delivery === "in_progress",
                        ).length
                      }
                    </strong>
                    <span>in progress</span>
                  </div>
                </div>
              )}
              {selectedProjects.length > 0 && (
                <div className="map-detail-section">
                  <h4>{person ? "Team projects" : "Supporting projects"}</h4>
                  {selectedProjects.map((p) => {
                    const n = allNodeMap.get(graphId("project", p.id));
                    return n ? nodeButton(n, deliveryLabels[p.delivery]) : null;
                  })}
                </div>
              )}
              <div className="map-detail-section">
                <h4>
                  Direct connections <span>{directLinks.length}</span>
                </h4>
                {directLinks.map((edge) => {
                  const n = allNodeMap.get(
                    edge.source === selected.id ? edge.target : edge.source,
                  );
                  return n ? (
                    <div key={edge.id}>
                      {nodeButton(n, connectionLabel(edge, selected.id))}
                    </div>
                  ) : null;
                })}
                {!directLinks.length && (
                  <p className="map-inspector-description">
                    No connections recorded yet.{" "}
                    {project
                      ? "Open this project to add its owner, contributors and priority."
                      : "Add reporting details or link this person to a project."}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="map-guide-icon" aria-hidden="true">
                <UiIcon name="target" className="action-icon" />
              </span>
              <p className="section-kicker">
                {viewMode === "grid" ? "ITEM DETAILS" : "MAP DETAILS"}
              </p>
              <h3>Select an item</h3>
              <p className="map-inspector-description">
                Select a person, project, or priority to view details and
                connections.
              </p>
              <div className="map-story">
                <span>01</span>
                <p>
                  <strong>Priorities</strong>View projects linked to each
                  business priority.
                </p>
              </div>
              <div className="map-story">
                <span>02</span>
                <p>
                  <strong>People</strong>View project owners, contributors, and
                  reporting lines.
                </p>
              </div>
              <div className="map-story">
                <span>03</span>
                <p>
                  <strong>Project health</strong>Amber markers indicate projects
                  requiring attention.
                </p>
              </div>
              <div className="map-detail-section">
                <h4>Top-priority projects</h4>
                {topProjects.length ? (
                  topProjects
                    .slice(0, 3)
                    .map((n) => nodeButton(n, "Top-priority project"))
                ) : (
                  <p className="map-inspector-description">
                    Projects marked as top priority appear here.
                  </p>
                )}
              </div>
              <div className="map-line-key">
                <span>
                  <i />
                  Project involvement / priority link
                </span>
                <span>
                  <i className="reporting" />
                  Reporting line
                </span>
                <span>
                  <i className="dependency" />
                  Project dependency
                </span>
              </div>
            </>
          )}
        </aside>
      </div>
      <div className="map-footer">
        <span>
          {viewMode === "grid"
            ? `${gridItems.length} of ${nodes.length} items`
            : `${nodes.length} items · ${visible.links.length} connections in view`}
        </span>
        <span>
          {viewMode === "grid"
            ? "Select a card to view details and connections"
            : "Node size: direct connections · Dragged positions are not saved"}
        </span>
        <button onClick={reset}>Reset view</button>
      </div>

    </section>
  );
}

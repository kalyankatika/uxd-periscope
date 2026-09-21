"use client";

import { useEffect, useRef, useState } from "react";
import { crafts, labels, type Initiative, type Plan } from "@/lib/domain";
import {
  getExplorerScope,
  organizationRef,
  type ExplorerRef,
  type ExplorerConnection,
} from "@/lib/workspace-explorer";
import { healthLabels, deliveryLabels } from "@/lib/work-graph";
import PeopleDialog, { type PeopleRequest } from "./people-dialog";
import UiIcon from "./ui-icon";
import "./workspace-explorer.css";

type Props = {
  plan: Plan;
  start: string;
  end: string;
  busy: boolean;
  onEdit: (project?: Initiative) => void;
  onSave: (plan: Plan) => Promise<boolean>;
  onOpenTool: (tool: "capacity" | "cutline" | "people" | "compare") => void;
};
const icons = {
  organization: "connections",
  person: "people",
  project: "compare",
  priority: "target",
} as const;
const kinds = {
  organization: "Organization",
  person: "Person",
  project: "Project",
  priority: "Priority",
};
const key = (ref: ExplorerRef) => `${ref.kind}:${ref.id}`;

export default function WorkspaceExplorer({
  plan,
  start,
  end,
  busy,
  onEdit,
  onSave,
  onOpenTool,
}: Props) {
  const [path, setPath] = useState<ExplorerRef[]>([organizationRef]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Summary");
  const [display, setDisplay] = useState("Map");
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(8);
  const [request, setRequest] = useState<PeopleRequest | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const graph = useRef<HTMLElement>(null);
  const current = path[path.length - 1] || organizationRef;
  const scope = getExplorerScope(plan, start, end, current);
  const person =
    current.kind === "person"
      ? plan.people.find((p) => p.id === current.id)
      : undefined;
  const project =
    current.kind === "project"
      ? plan.initiatives.find((p) => p.id === current.id)
      : undefined;
  useEffect(() => {
    if (scope.missing) setPath([organizationRef]);
  }, [scope.missing]);
  function navigate(ref: ExplorerRef) {
    const existing = path.findIndex((p) => key(p) === key(ref));
    setPath(existing >= 0 ? path.slice(0, existing + 1) : [...path, ref]);
    setQuery("");
    setFilter("all");
    setLimit(8);
    setTab("Summary");
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  function back(index: number) {
    setPath(path.slice(0, index + 1));
    setQuery("");
    setFilter("all");
    setLimit(8);
    setTab("Summary");
    requestAnimationFrame(() =>
      heading.current?.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  }
  const searchItems: ExplorerConnection[] = [
    ...plan.people.map((p) => ({
      ref: { kind: "person" as const, id: p.id },
      label: p.name,
      relation: p.title || p.team || "Person",
    })),
    ...plan.initiatives.map((p) => ({
      ref: { kind: "project" as const, id: p.id },
      label: p.name,
      relation: p.priority || "Project",
    })),
    ...[
      ...new Set(plan.initiatives.map((p) => p.priority).filter(Boolean)),
    ].map((p) => ({
      ref: { kind: "priority" as const, id: p },
      label: p,
      relation: "Priority",
    })),
  ];
  const matches = query.trim()
    ? searchItems.filter((p) =>
        `${p.label} ${p.relation}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : [];
  const connections = scope.related.filter(
    (c) => filter === "all" || c.ref.kind === filter,
  );
  const visible = connections.slice(0, limit);
  const attention = scope.projects.filter(
    (p) =>
      p.delivery !== "completed" &&
      (p.health === "at_risk" ||
        p.health === "needs_decision" ||
        p.delivery === "blocked"),
  );
  const unowned = scope.projects.filter(
    (p) => !p.leadId && p.delivery !== "completed",
  );
  function connection(c: ExplorerConnection) {
    return (
      <button
        className={`explorer-node explorer-node-${c.ref.kind}`}
        key={key(c.ref)}
        onClick={() => navigate(c.ref)}
      >
        <span className="explorer-node-icon">
          <UiIcon name={icons[c.ref.kind]} className="action-icon" />
        </span>
        <span className="explorer-node-copy">
          <small>{c.relation}</small>
          <strong>{c.label}</strong>
        </span>
        <UiIcon name="arrowRight" className="action-icon" />
      </button>
    );
  }
  function projectRows(projects: Initiative[]) {
    return projects.length ? (
      <div className="explorer-rows">
        {projects.map((p) => (
          <button
            key={p.id}
            className="explorer-row"
            onClick={() => navigate({ kind: "project", id: p.id })}
          >
            <span>
              <strong>{p.name}</strong>
              <small>
                {p.priority || "No priority assigned"} ·{" "}
                {deliveryLabels[p.delivery]}
              </small>
            </span>
            <span className={`explorer-health explorer-health-${p.health}`}>
              {healthLabels[p.health]}
            </span>
            <UiIcon name="arrowRight" className="action-icon" />
          </button>
        ))}
      </div>
    ) : (
      <p className="explorer-empty">No projects in this planning period.</p>
    );
  }
  return (
    <section className="explorer" aria-label="Organization explorer">
      <nav className="explorer-breadcrumb" aria-label="Explorer breadcrumb">
        {path.map((ref, i) => (
          <span key={`${key(ref)}-${i}`}>
            {i > 0 && <UiIcon name="arrowRight" className="action-icon" />}
            <button
              onClick={() => back(i)}
              aria-current={i === path.length - 1 ? "page" : undefined}
            >
              {getExplorerScope(plan, start, end, ref).label}
            </button>
          </span>
        ))}
      </nav>
      <div className="explorer-heading">
        <div>
          <p className="explorer-eyebrow">
            {kinds[current.kind]} · Explorer preview
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {scope.label}
          </h2>
          <p>{scope.subtitle}</p>
        </div>
        <div className="explorer-actions">
          <button
            onClick={() => {
              detailHeading.current?.focus({ preventScroll: true });
              detailHeading.current?.scrollIntoView({
                block: "start",
                behavior: "instant",
              });
            }}
          >
            <UiIcon name="arrowDown" className="action-icon" />
            Details
          </button>
          {path.length > 1 && (
            <button onClick={() => back(path.length - 2)}>
              <UiIcon name="arrowLeft" className="action-icon" />
              Back
            </button>
          )}
          {person ? (
            <>
              <button
                disabled={busy}
                onClick={() =>
                  setRequest({ kind: "move", personId: person.id })
                }
              >
                Move person
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  setRequest({ kind: "edit", personId: person.id })
                }
              >
                Edit person
              </button>
            </>
          ) : project ? (
            <button
              className="primary"
              disabled={busy}
              onClick={() => onEdit(project)}
            >
              Edit project
            </button>
          ) : (
            <button
              className="primary"
              disabled={busy}
              onClick={() => onEdit()}
            >
              <UiIcon name="plus" className="action-icon" />
              Add project
            </button>
          )}
        </div>
      </div>
      <div className="explorer-search">
        <UiIcon name="search" className="action-icon" />
        <input
          aria-label="Search organization, projects and priorities"
          placeholder="Find a person, project or priority"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            aria-label="Clear explorer search"
            onClick={() => setQuery("")}
          >
            <UiIcon name="close" className="action-icon" />
          </button>
        )}
      </div>
      {query.trim() ? (
        <section
          className="explorer-search-results"
          aria-label="Search results"
        >
          <p role="status">{matches.length} results · Entire workspace</p>
          <div className="explorer-list">
            {matches.slice(0, 40).map(connection)}
          </div>
          {matches.length > 40 && (
            <p>Showing the first 40 results. Refine your search.</p>
          )}
          {!matches.length && <p>No matches. Try a name, role or priority.</p>}
        </section>
      ) : (
        <>
          <div className="explorer-map-toolbar">
            <div className="explorer-filters" aria-label="Connection types">
              {[
                ["all", "All"],
                ["person", "People"],
                ["project", "Projects"],
                ["priority", "Priorities"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(value);
                    setLimit(8);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="explorer-display" aria-label="Connection display">
              {["Map", "List"].map((value) => (
                <button
                  key={value}
                  aria-pressed={display === value}
                  onClick={() => setDisplay(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <section
            ref={graph}
            className={`explorer-graph ${display === "List" ? "is-list" : ""}`}
            aria-label={`${scope.label} connections`}
          >
            <div className="explorer-hub">
              <span className="explorer-hub-symbol">
                <UiIcon name={icons[current.kind]} className="action-icon" />
              </span>
              <strong>{scope.label}</strong>
              <span>
                {scope.people.length}{" "}
                {scope.people.length === 1 ? "person" : "people"} ·{" "}
                {scope.projects.length}{" "}
                {scope.projects.length === 1 ? "project" : "projects"}
              </span>
              <small>Choose a connection to explore</small>
            </div>
            <div className="explorer-spokes">{visible.map(connection)}</div>
            {!visible.length && (
              <p className="explorer-empty">
                No{" "}
                {filter === "all"
                  ? "connections"
                  : filter === "person"
                    ? "people"
                    : `${filter}s`}{" "}
                in this view.
              </p>
            )}
            {connections.length > limit && (
              <button
                className="explorer-more"
                onClick={() => setLimit(limit + 8)}
              >
                Show more connections ({connections.length - limit})
                <UiIcon name="plus" className="action-icon" />
              </button>
            )}
          </section>
        </>
      )}
      <div className="explorer-detail-heading">
        <h3 ref={detailHeading} tabIndex={-1}>
          Details
        </h3>
        <span>
          {start} — {end}
        </span>
      </div>
      <div className="explorer-tabs" aria-label="Detail sections">
        {["Summary", "Projects", "People", "Capacity"].map((value) => (
          <button
            key={value}
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {value}
            {value === "Projects"
              ? ` (${scope.projects.length})`
              : value === "People"
                ? ` (${scope.people.length})`
                : ""}
          </button>
        ))}
      </div>
      <section
        className="explorer-detail"
        aria-label={`${tab} for ${scope.label}`}
      >
        {tab === "Summary" && (
          <>
            <div className="explorer-metrics">
              <button onClick={() => setTab("Projects")}>
                <strong>{scope.projects.length}</strong>
                <span>
                  {scope.projects.length === 1 ? "Project" : "Projects"}
                </span>
              </button>
              <button onClick={() => setTab("People")}>
                <strong>{scope.people.length}</strong>
                <span>{scope.people.length === 1 ? "Person" : "People"}</span>
              </button>
              <button
                onClick={() => {
                  setFilter("priority");
                  requestAnimationFrame(() =>
                    graph.current?.scrollIntoView({
                      block: "start",
                      behavior: "instant",
                    }),
                  );
                  setLimit(8);
                  setQuery("");
                }}
              >
                <strong>{scope.priorities.length}</strong>
                <span>
                  {scope.priorities.length === 1 ? "Priority" : "Priorities"}
                </span>
              </button>
              <div>
                <strong>{attention.length}</strong>
                <span>
                  {attention.length === 1
                    ? "Needs attention"
                    : "Need attention"}
                </span>
              </div>
            </div>
            {project && (
              <div className="explorer-project-brief">
                <p>{project.summary || "No project summary added."}</p>
                <dl>
                  <div>
                    <dt>Delivery</dt>
                    <dd>{deliveryLabels[project.delivery]}</dd>
                  </div>
                  <div>
                    <dt>Health</dt>
                    <dd>{healthLabels[project.health]}</dd>
                  </div>
                  <div>
                    <dt>Dates</dt>
                    <dd>
                      {project.start} — {project.end}
                    </dd>
                  </div>
                </dl>
                {project.update && (
                  <p>
                    <strong>Latest update</strong>
                    <br />
                    {project.update}
                  </p>
                )}
                {project.decision && (
                  <p>
                    <strong>Decision required</strong>
                    <br />
                    {project.decision}
                  </p>
                )}
              </div>
            )}
            <div className="explorer-section-title">
              <h4>Suggested actions</h4>
              <span>Based on current workspace data</span>
            </div>
            {attention.length > 0 ? (
              projectRows(attention)
            ) : (
              <p className="explorer-empty">
                No projects are marked at risk, blocked or requiring a decision.
              </p>
            )}
            {unowned.length > 0 && (
              <button
                className="explorer-suggestion"
                disabled={busy}
                onClick={() => onEdit(unowned[0])}
              >
                <UiIcon name="people" className="action-icon" />
                <span>
                  Assign a lead to {unowned[0].name}
                  <small>
                    {unowned.length} project{unowned.length === 1 ? "" : "s"}{" "}
                    without a lead in this view
                  </small>
                </span>
                <UiIcon name="arrowRight" className="action-icon" />
              </button>
            )}
          </>
        )}
        {tab === "Projects" && projectRows(scope.projects)}
        {tab === "People" && (
          <>
            <div className="explorer-section-title">
              <p>
                {person
                  ? "Selected person and all reports"
                  : project
                    ? "Project lead and contributors"
                    : "People in this view"}
              </p>
              <button
                disabled={busy}
                onClick={() =>
                  setRequest({ kind: "add", managerId: person?.id })
                }
              >
                <UiIcon name="plus" className="action-icon" />
                Add person
              </button>
            </div>
            <div className="explorer-rows">
              {scope.people.map((p) => (
                <button
                  className="explorer-row"
                  key={p.id}
                  onClick={() => navigate({ kind: "person", id: p.id })}
                >
                  <span className="explorer-avatar" aria-hidden="true">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.title || p.team || labels[p.craft]}</small>
                  </span>
                  <UiIcon name="arrowRight" className="action-icon" />
                </button>
              ))}
            </div>
            {!scope.people.length && (
              <p className="explorer-empty">No people linked to this view.</p>
            )}
          </>
        )}
        {tab === "Capacity" && (
          <>
            <p>
              Weekly project availability for the people in this view, after
              their non-project time. This is not a record of individual project
              bookings.
            </p>
            <div className="explorer-capacity">
              {crafts.map((craft) => (
                <div key={craft}>
                  <span>{labels[craft]}</span>
                  <strong>
                    {scope.people
                      .filter((p) => p.craft === craft)
                      .reduce(
                        (sum, p) => sum + p.fte * (1 - p.nonProjectPct / 100),
                        0,
                      )
                      .toFixed(1)}
                    <small> FTE</small>
                  </strong>
                </div>
              ))}
            </div>
            <button onClick={() => onOpenTool("capacity")}>
              Open workspace capacity
              <UiIcon name="arrowUpRight" className="action-icon" />
            </button>
          </>
        )}
      </section>
      <section className="explorer-tools" aria-label="Workspace tools">
        <div>
          <h3>Workspace tools</h3>
          <p>Open the full workspace. Return here to keep exploring.</p>
        </div>
        <div>
          {(
            [
              ["compare", "Compare projects"],
              ["capacity", "Capacity"],
              ["cutline", "Plan"],
              ["people", "People & imports"],
            ] as const
          ).map(([tool, label]) => (
            <button key={tool} onClick={() => onOpenTool(tool)}>
              <UiIcon name={tool} className="action-icon" />
              {label}
              <UiIcon name="arrowUpRight" className="action-icon" />
            </button>
          ))}
        </div>
      </section>
      {request && (
        <PeopleDialog
          plan={plan}
          request={request}
          busy={busy}
          onSave={onSave}
          onClose={() => setRequest(null)}
        />
      )}
    </section>
  );
}

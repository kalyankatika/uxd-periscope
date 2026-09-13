"use client";
import UiIcon from "./ui-icon";
import { useMemo, useRef, useState } from "react";
import {
  type Plan,
  type Person,
  type Initiative,
  labels,
  crafts,
} from "@/lib/domain";
import {
  teamIds,
  leaderProjects,
  leaders,
  relatedProjects,
  workGraph,
  healthLabels,
  deliveryLabels,
  importanceLabels,
  importanceOrder,
} from "@/lib/work-graph";
import { exportCsv } from "@/lib/csv";
import WorkMap from "./work-map";
import PeopleDialog, { type PeopleRequest } from "./people-dialog";
type Mode = "overview" | "teams" | "compare" | "connections";
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
const shortDate = (d: string) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const effort = (p: Initiative) =>
  Object.values(p.effort).reduce((a, b) => a + b, 0);
const needsAttention = (p: Initiative) =>
  p.delivery !== "completed" &&
  (p.health === "at_risk" ||
    p.health === "needs_decision" ||
    p.delivery === "blocked");
function saveFile(
  name: string,
  value: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([value], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Health({ project }: { project: Initiative }) {
  return (
    <span
      className={
        "work-health " +
        (project.delivery === "completed"
          ? "complete"
          : project.delivery === "blocked"
            ? "needs_decision"
            : project.health)
      }
    >
      <span aria-hidden="true" />
      {project.delivery === "completed"
        ? "Completed"
        : project.delivery === "blocked"
          ? "Blocked"
          : healthLabels[project.health]}
    </span>
  );
}
function focusProjectHeading(node: HTMLHeadingElement | null) {
  node?.focus({ preventScroll: true });
}
export default function Leadership({
  plan,
  start,
  end,
  mode,
  onEdit,
  onSave,
  onMode,
  busy,
}: {
  plan: Plan;
  start: string;
  end: string;
  mode: Mode;
  onEdit: (p: Initiative) => void;
  onSave: (p: Plan) => Promise<boolean>;
  onMode: (m: Mode) => void;
  busy: boolean;
}) {
  const [leaderId, setLeaderId] = useState<string | null>(null),
    [projectId, setProjectId] = useState<string | null>(null),
    [search, setSearch] = useState(""),
    [review, setReview] = useState("all"),
    [sort, setSort] = useState<
      "importance" | "health" | "name" | "end" | "effort" | "lead"
    >("importance"),
    [ascending, setAscending] = useState(true),
    [connectionId, setConnectionId] = useState(""),
    [peopleRequest, setPeopleRequest] = useState<PeopleRequest | null>(null),
    [draggedId, setDraggedId] = useState<string | null>(null),
    [dropTarget, setDropTarget] = useState<string | null>(null);
  const projectDialog = useRef<HTMLDialogElement>(null);
  const peopleById = useMemo(
    () => new Map(plan.people.map((p) => [p.id, p])),
    [plan.people],
  );
  const period = useMemo(
    () => plan.initiatives.filter((p) => p.start <= end && p.end >= start),
    [plan.initiatives, start, end],
  );
  const leaderList = leaders(plan.people);
  const topLeaders = leaderList.filter(
    (l) => l.managerId && !peopleById.get(l.managerId)?.managerId,
  );
  const cards = topLeaders.length
    ? topLeaders
    : leaderList.filter((l) => !l.managerId);
  const leader = leaderId ? peopleById.get(leaderId) : undefined;
  const groupIds = leader ? teamIds(plan.people, leader.id) : new Set<string>();
  const group = leader
    ? leaderProjects({ ...plan, initiatives: period }, leader.id)
    : period;
  const selected = plan.initiatives.find((p) => p.id === projectId);
  const related = selected ? relatedProjects(plan, selected) : [];
  const tops = period
    .filter((p) => p.importance === "top" && p.delivery !== "completed")
    .sort((a, b) => a.end.localeCompare(b.end));
  const attention = period.filter(needsAttention);
  const scope = mode === "compare" && leaderId ? group : period;
  const filtered = scope.filter(
    (p) =>
      [
        p.name,
        p.summary,
        p.priority,
        peopleById.get(p.leadId || "")?.name || p.owner,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (review === "all" ||
        (review === "attention" && needsAttention(p)) ||
        (review === "top" && p.importance === "top") ||
        (review === "progress" && p.delivery === "in_progress") ||
        (review === "unassigned" && !p.leadId)),
  );
  const healthOrder = {
    needs_decision: 0,
    at_risk: 1,
    not_reported: 2,
    on_track: 3,
  };
  const sorted = [...filtered].sort((a, b) => {
    let n = 0;
    if (sort === "importance")
      n = importanceOrder[a.importance] - importanceOrder[b.importance];
    if (sort === "health") n = healthOrder[a.health] - healthOrder[b.health];
    if (sort === "name") n = a.name.localeCompare(b.name);
    if (sort === "end") n = a.end.localeCompare(b.end);
    if (sort === "effort") n = effort(a) - effort(b);
    if (sort === "lead")
      n = (peopleById.get(a.leadId || "")?.name || a.owner).localeCompare(
        peopleById.get(b.leadId || "")?.name || b.owner,
      );
    return (ascending ? 1 : -1) * n || a.name.localeCompare(b.name);
  });
  function openProject(p: Initiative) {
    setProjectId(p.id);
    projectDialog.current?.showModal();
  }
  function openLeader(id: string) {
    setLeaderId(id);
    onMode("teams");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openPerson(p?: Person, managerId?: string) {
    setPeopleRequest(
      p ? { kind: "edit", personId: p.id } : { kind: "add", managerId },
    );
  }
  function canDrop(managerId: string | null) {
    return (
      !!draggedId &&
      !busy &&
      managerId !== peopleById.get(draggedId)?.managerId &&
      (managerId === null || !teamIds(plan.people, draggedId).has(managerId))
    );
  }
  function dropPerson(event: React.DragEvent, managerId: string | null) {
    event.preventDefault();
    event.stopPropagation();
    if (canDrop(managerId) && draggedId)
      setPeopleRequest({ kind: "move", personId: draggedId, managerId });
    setDraggedId(null);
    setDropTarget(null);
  }
  function setSortColumn(value: typeof sort) {
    if (sort === value) setAscending(!ascending);
    else {
      setSort(value);
      setAscending(true);
    }
  }
  function leadName(p: Initiative) {
    return (
      peopleById.get(p.leadId || "")?.name || p.owner || "Unassigned owner"
    );
  }
  function compareExport() {
    saveFile(
      "leadership-project-review.csv",
      exportCsv(
        sorted.map((p) => ({
          project: p.name,
          priority: p.priority,
          importance: importanceLabels[p.importance],
          lead: leadName(p),
          team: peopleById.get(p.leadId || "")?.team || "",
          progress: deliveryLabels[p.delivery],
          health: healthLabels[p.health],
          outcome: p.summary,
          latestUpdate: p.update,
          helpNeeded: p.decision,
          start: p.start,
          end: p.end,
          peopleInvolved: new Set([p.leadId, ...p.memberIds].filter(Boolean))
            .size,
          weeklyTimeInFullTimePeople: effort(p),
          commitment: p.status,
        })),
      ),
    );
  }
  function projectRows(items: Initiative[]) {
    return (
      <div className="leader-project-list">
        {items.map((p) => (
          <article className="leader-project-row" key={p.id}>
            <div>
              <span className="project-priority-label">
                {p.priority || "No business priority"}
              </span>
              <button
                className="project-title-button"
                onClick={() => openProject(p)}
              >
                {p.name}
                <span aria-hidden="true">
                  <UiIcon name="arrowUpRight" className="action-icon" />
                </span>
              </button>
              <p>{p.summary || "No outcome recorded."}</p>
              <div className="project-row-meta">
                <span>{leadName(p)}</span>
                <span>Due {shortDate(p.end)}</span>
                {p.importance === "top" && (
                  <span className="top-label">Top priority</span>
                )}
              </div>
            </div>
            <Health project={p} />
          </article>
        ))}
        {!items.length && (
          <div className="lead-empty">
            No linked projects. Assign a project owner or contributor to add a
            project to this team.
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="leadership">
      {mode === "overview" && (
        <>
          <div className="lead-summary" aria-label="Leadership snapshot">
            <div>
              <strong>{period.length}</strong>
              <span>projects in view</span>
            </div>
            <div>
              <strong>
                {period.filter((p) => p.delivery === "in_progress").length}
              </strong>
              <span>in progress</span>
            </div>
            <button
              onClick={() => {
                setReview("attention");
                onMode("compare");
              }}
              className={attention.length ? "summary-attention" : ""}
            >
              <strong>{attention.length}</strong>
              <span>
                need attention{" "}
                <span aria-hidden="true">
                  <UiIcon name="arrowUpRight" className="action-icon" />
                </span>
              </span>
            </button>
            <div>
              <strong>{cards.length}</strong>
              <span>leadership teams</span>
            </div>
          </div>
          <div className="brief-layout">
            <section className="lead-panel priority-brief">
              <div className="lead-section-heading">
                <div>
                  <p className="section-kicker">PRIORITIES</p>
                  <h2>Top-priority projects</h2>
                </div>
                <button
                  className="quiet-link"
                  onClick={() => {
                    setReview("top");
                    onMode("compare");
                  }}
                >
                  View top-priority projects{" "}
                  <UiIcon name="arrowRight" className="action-icon" />
                </button>
              </div>
              {tops.slice(0, 4).map((p, index) => (
                <article className="priority-story" key={p.id}>
                  <span className="priority-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="project-priority-label">
                      {p.priority || "No business priority"}
                    </span>
                    <button
                      className="project-title-button"
                      onClick={() => openProject(p)}
                    >
                      {p.name}
                      <span aria-hidden="true">
                        <UiIcon name="arrowUpRight" className="action-icon" />
                      </span>
                    </button>
                    <p>{p.summary || "No outcome recorded."}</p>
                    <div className="story-foot">
                      <span className="mini-person">
                        <span className="mini-avatar">
                          {initials(leadName(p))}
                        </span>
                        {leadName(p)}
                      </span>
                      <Health project={p} />
                    </div>
                  </div>
                </article>
              ))}
              {!tops.length && (
                <div className="lead-empty">
                  <h3>No top-priority projects</h3>
                  <p>
                    Set a project's importance to Top priority to include it
                    here.
                  </p>
                  <button onClick={() => onMode("compare")}>
                    View projects{" "}
                    <UiIcon name="arrowRight" className="action-icon" />
                  </button>
                </div>
              )}
            </section>
            <aside className="attention-panel">
              <div className="lead-section-heading">
                <div>
                  <p className="section-kicker">PROJECT HEALTH</p>
                  <h2>Items requiring attention</h2>
                </div>
                <span className="attention-count">{attention.length}</span>
              </div>
              {attention.slice(0, 3).map((p) => (
                <button
                  className="attention-item"
                  key={p.id}
                  onClick={() => openProject(p)}
                >
                  <span>
                    {p.health === "needs_decision"
                      ? "Decision required"
                      : p.delivery === "blocked"
                        ? "Blocked"
                        : "At risk"}
                  </span>
                  <strong>{p.name}</strong>
                  <p>
                    {p.decision ||
                      p.update ||
                      "Open project details for the latest status."}
                  </p>
                  <span className="attention-action">
                    View project{" "}
                    <UiIcon name="arrowRight" className="action-icon" />
                  </span>
                </button>
              ))}
              {!attention.length && (
                <div className="lead-empty">
                  <h3>No issues reported</h3>
                  <p>
                    {period.some((p) => p.health === "not_reported")
                      ? "Some projects still need a status update."
                      : "Teams have not flagged any decisions or delivery concerns."}
                  </p>
                </div>
              )}
            </aside>
          </div>
          <section className="teams-section">
            <div className="lead-section-heading">
              <div>
                <p className="section-kicker">ORGANIZATION</p>
                <h2>Teams</h2>
                <p>
                  Select a leader to see their team’s projects, including work
                  led by their reports.
                </p>
              </div>
              <button
                className="quiet-link"
                onClick={() => {
                  setLeaderId(null);
                  onMode("teams");
                }}
              >
                View reporting structure{" "}
                <UiIcon name="arrowRight" className="action-icon" />
              </button>
            </div>
            <div className="leader-cards">
              {cards.map((p, index) => {
                const projects = leaderProjects(
                    { ...plan, initiatives: period },
                    p.id,
                  ),
                  attentionCount = projects.filter(needsAttention).length;
                return (
                  <article className="leader-card" key={p.id}>
                    <div className="leader-card-top">
                      <span
                        className={"person-avatar avatar-tone-" + (index % 4)}
                      >
                        {initials(p.name)}
                      </span>
                      <span>
                        {teamIds(plan.people, p.id).size - 1} people in team
                      </span>
                    </div>
                    <button
                      className="leader-name"
                      onClick={() => openLeader(p.id)}
                    >
                      {p.name}
                      <span aria-hidden="true">
                        <UiIcon name="arrowUpRight" className="action-icon" />
                      </span>
                    </button>
                    <p>{p.team || p.title || "Team leader"}</p>
                    <div className="leader-card-focus">
                      {[
                        ...new Set(
                          projects
                            .filter((x) => x.importance === "top")
                            .map((x) => x.priority),
                        ),
                      ]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(" · ") || "No top priority assigned"}
                    </div>
                    <div className="leader-card-bottom">
                      <span>
                        <strong>{projects.length}</strong> projects
                      </span>
                      <span
                        className={
                          attentionCount ? "small-attention" : "small-healthy"
                        }
                      >
                        {attentionCount
                          ? `${attentionCount} to review`
                          : "No issues reported"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
            {!cards.length && (
              <div className="lead-empty">
                No teams configured. Add reporting relationships to list teams.{" "}
                <button onClick={() => onMode("teams")}>
                  Edit reporting structure
                </button>
              </div>
            )}
          </section>
        </>
      )}
      {mode === "teams" && (
        <>
          <div className="leader-view-toolbar">
            <button onClick={() => setLeaderId(null)} className="quiet-link">
              {leader ? (
                <>
                  <UiIcon name="arrowLeft" className="action-icon" /> All teams
                </>
              ) : (
                "Reporting structure"
              )}
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={() => openPerson()}
            >
              <UiIcon name="plus" className="action-icon" /> Add person
            </button>
          </div>
          {leader ? (
            <>
              <section className="leader-profile">
                <span className="person-avatar large-avatar">
                  {initials(leader.name)}
                </span>
                <div>
                  <p className="section-kicker">{leader.team || "TEAM VIEW"}</p>
                  <h2>{leader.name}</h2>
                  <p>
                    {leader.title || "Team member"}
                    {leader.managerId &&
                      ` · Reports to ${peopleById.get(leader.managerId)?.name || "unassigned"}`}
                  </p>
                </div>
                <button onClick={() => openPerson(leader)}>Edit person</button>
                <button
                  disabled={busy}
                  onClick={() =>
                    setPeopleRequest({ kind: "move", personId: leader.id })
                  }
                >
                  Move
                </button>
                <div className="leader-profile-stats">
                  <span>
                    <strong>{groupIds.size - 1}</strong> people in team
                  </span>
                  <span>
                    <strong>{group.length}</strong> related projects
                  </span>
                  <span>
                    <strong>{group.filter(needsAttention).length}</strong> to
                    review
                  </span>
                </div>
              </section>
              <div className="team-detail-layout">
                <section className="lead-panel">
                  <div className="lead-section-heading">
                    <div>
                      <h2>{leader.name.split(" ")[0]}’s team projects</h2>
                      <p>
                        Includes projects owned by their reports and projects
                        with team contributors. Shared projects appear once.
                      </p>
                    </div>
                    <button
                      className="quiet-link"
                      onClick={() => onMode("compare")}
                    >
                      Compare projects{" "}
                      <UiIcon name="arrowRight" className="action-icon" />
                    </button>
                  </div>
                  {projectRows(group)}
                </section>
                <aside className="reports-panel">
                  <h2>Direct reports</h2>
                  {plan.people
                    .filter((p) => p.managerId === leader.id)
                    .map((p) => (
                      <div className="report-person" key={p.id}>
                        <span className="mini-avatar">{initials(p.name)}</span>
                        <button onClick={() => openLeader(p.id)}>
                          <strong>{p.name}</strong>
                          <small>{p.title || labels[p.craft]}</small>
                        </button>
                        <button
                          className="person-edit"
                          aria-label={"Edit " + p.name}
                          onClick={() => openPerson(p)}
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  {!plan.people.some((p) => p.managerId === leader.id) && (
                    <p className="muted">No direct reports recorded.</p>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => openPerson(undefined, leader.id)}
                  >
                    <UiIcon name="plus" className="action-icon" /> Add direct
                    report
                  </button>
                </aside>
              </div>
            </>
          ) : (
            <section className="lead-panel organization-panel">
              <div className="lead-section-heading">
                <div>
                  <h2>Reporting structure</h2>
                  <p>
                    Open a person to see their work. Use Move or drag the handle
                    onto a new manager. Moves are reviewed before saving.
                  </p>
                </div>
                <span>{plan.people.length} people</span>
              </div>
              <div
                className={
                  "reporting-root-drop" +
                  (dropTarget === "root" ? " drop-ready" : "")
                }
                onDragOver={(event) => {
                  if (canDrop(null)) {
                    event.preventDefault();
                    setDropTarget("root");
                  }
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(event) => dropPerson(event, null)}
              >
                No manager in this workspace{" "}
                <span>Drop here to move to the top level</span>
              </div>
              {renderTree(null, new Set())}
              {!plan.people.length && (
                <div className="lead-empty">
                  No people added. Add leaders and team members, then assign
                  their managers.
                </div>
              )}
            </section>
          )}
        </>
      )}
      {mode === "compare" && (
        <section className="lead-panel comparison-panel">
          <div className="lead-section-heading">
            <div>
              <p className="section-kicker">PROJECT REVIEW</p>
              <h2>Project comparison</h2>
              <p>Select a column heading to sort projects.</p>
            </div>
            <button onClick={compareExport}>
              <UiIcon name="download" className="action-icon" /> Export this
              view
            </button>
          </div>
          <div className="comparison-controls">
            <label className="comparison-search">
              Search projects
              <input
                type="search"
                value={search}
                placeholder="Search a project, outcome, or person"
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label>
              Team
              <select
                value={leaderId || ""}
                onChange={(e) => setLeaderId(e.target.value || null)}
              >
                <option value="">All teams</option>
                {leader && !leaderList.some((p) => p.id === leader.id) && (
                  <option value={leader.id}>
                    {leader.name} · Individual work
                  </option>
                )}
                {leaderList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.team || "Team"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Filter
              <select
                value={review}
                onChange={(e) => setReview(e.target.value)}
              >
                <option value="all">All projects</option>
                <option value="top">Top priorities</option>
                <option value="attention">Needs attention</option>
                <option value="progress">In progress</option>
                <option value="unassigned">Unassigned owner</option>
              </select>
            </label>
            <span>{sorted.length} projects</span>
          </div>
          <div className="table-scroll">
            <table className="parity-grid">
              <thead>
                <tr>
                  {[
                    ["name", "Project / outcome"],
                    ["importance", "Importance"],
                    ["lead", "Project owner"],
                    ["health", "Project health"],
                    ["end", "Due"],
                    ["effort", "Weekly effort"],
                  ].map(([value, label]) => (
                    <th
                      key={value}
                      aria-sort={
                        sort === value
                          ? ascending
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        onClick={() => setSortColumn(value as typeof sort)}
                      >
                        {label}{" "}
                        <UiIcon
                          name={
                            sort === value
                              ? ascending
                                ? "arrowUp"
                                : "arrowDown"
                              : "sort"
                          }
                          className="action-icon"
                        />
                      </button>
                    </th>
                  ))}
                  <th>Action required</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <button
                        className="project-title-button"
                        onClick={() => openProject(p)}
                      >
                        {p.name}{" "}
                        <UiIcon name="arrowUpRight" className="action-icon" />
                      </button>
                      <p>{p.summary || "No outcome recorded"}</p>
                      <span>{p.priority || "No business priority"}</span>
                    </td>
                    <td>
                      <span className={"importance " + p.importance}>
                        {importanceLabels[p.importance]}
                      </span>
                    </td>
                    <td>
                      {leadName(p)}
                      <small>
                        {peopleById.get(p.leadId || "")?.team ||
                          "No team assigned"}
                      </small>
                    </td>
                    <td>
                      <Health project={p} />
                      <small>{deliveryLabels[p.delivery]}</small>
                    </td>
                    <td>{shortDate(p.end)}</td>
                    <td>
                      {effort(p).toFixed(1)} FTE
                      <small>combined weekly effort</small>
                    </td>
                    <td className="decision-cell">
                      {p.decision ||
                        (needsAttention(p)
                          ? p.update || "Contact project owner"
                          : "None recorded")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!sorted.length && (
            <div className="lead-empty">
              <h3>No projects match.</h3>
              <button
                onClick={() => {
                  setSearch("");
                  setReview("all");
                  setLeaderId(null);
                }}
              >
                Show all projects
              </button>
            </div>
          )}
          <div className="comparison-footnote">
            FTE means full-time equivalent: 1.0 is one person's full working
            week. Effort is the combined time requested, not the number of
            assigned people. Proposed projects are included; commitment is shown
            in project details.
          </div>
        </section>
      )}
      {mode === "connections" && (
        <WorkMap
          key={`${start}:${end}`}
          plan={plan}
          start={start}
          end={end}
          initialProjectId={connectionId}
          onProject={openProject}
          onPerson={openLeader}
          onCompare={() => {
            setLeaderId(null);
            onMode("compare");
          }}
          onExport={() =>
            saveFile(
              "uxd-work-graph.jsonld",
              JSON.stringify(workGraph(plan), null, 2),
              "application/ld+json",
            )
          }
        />
      )}
      <dialog
        ref={projectDialog}
        className="drawer leadership-project-detail"
        aria-labelledby="lead-project-title"
        onClose={() => setProjectId(null)}
      >
        {selected && (
          <div className="detail-content" key={selected.id}>
            <div className="panel-head">
              <div>
                <p className="section-kicker">
                  {selected.priority || "PROJECT OVERVIEW"}
                </p>
                <h2
                  id="lead-project-title"
                  tabIndex={-1}
                  ref={focusProjectHeading}
                >
                  {selected.name}
                </h2>
              </div>
              <button
                aria-label="Close project"
                onClick={() => projectDialog.current?.close()}
              >
                <UiIcon name="close" className="action-icon" />
              </button>
            </div>
            <div className="drawer-body">
              <div className="detail-status">
                <Health project={selected} />
                <span className={"importance " + selected.importance}>
                  {importanceLabels[selected.importance]}
                </span>
              </div>
              <h3>Expected outcome</h3>
              <p className="outcome-statement">
                {selected.summary || "No outcome recorded."}
              </p>
              <h3>Latest update</h3>
              <p>{selected.update || "No update recorded."}</p>
              {(selected.decision || needsAttention(selected)) && (
                <div className="decision-callout">
                  <h3>
                    {selected.health === "needs_decision"
                      ? "Decision required"
                      : "Action required"}
                  </h3>
                  <p>
                    {selected.decision ||
                      selected.update ||
                      "Contact the project owner for an update."}
                  </p>
                </div>
              )}
              <dl className="project-facts">
                <div>
                  <dt>Project owner</dt>
                  <dd>
                    {selected.leadId ? (
                      <button
                        className="quiet-link"
                        onClick={() => {
                          projectDialog.current?.close();
                          openLeader(selected.leadId!);
                        }}
                      >
                        {leadName(selected)}{" "}
                        <UiIcon name="arrowRight" className="action-icon" />
                      </button>
                    ) : (
                      leadName(selected)
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>{deliveryLabels[selected.delivery]}</dd>
                </div>
                <div>
                  <dt>Dates</dt>
                  <dd>
                    {shortDate(selected.start)} – {shortDate(selected.end)}
                  </dd>
                </div>
                <div>
                  <dt>Commitment</dt>
                  <dd>
                    {
                      {
                        committed: "Committed",
                        proposed: "Proposed",
                        stretch: "Backlog",
                      }[selected.status]
                    }
                  </dd>
                </div>
              </dl>
              <h3>Project team</h3>
              <div className="involved-people">
                {[
                  ...new Set(
                    [selected.leadId, ...selected.memberIds].filter(
                      (id): id is string => Boolean(id),
                    ),
                  ),
                ].map((id) => {
                  const p = peopleById.get(id);
                  return (
                    p && (
                      <button
                        key={id}
                        onClick={() => {
                          projectDialog.current?.close();
                          openLeader(id);
                        }}
                      >
                        <span className="mini-avatar">{initials(p.name)}</span>
                        <span>
                          {p.name}
                          <small>{p.team || labels[p.craft]}</small>
                        </span>
                      </button>
                    )
                  );
                })}
                {!selected.leadId && !selected.memberIds.length && (
                  <p className="muted">
                    No people have been linked to this project.
                  </p>
                )}
              </div>
              <details className="effort-details">
                <summary>Weekly effort</summary>
                <p className="muted">
                  Combined full-week time requested, not individual assignments.
                  For example, 0.5 means half of one full-time person’s week.
                </p>
                {crafts.map((c) => (
                  <div key={c}>
                    <span>{labels[c]}</span>
                    <strong>{selected.effort[c].toFixed(1)} FTE</strong>
                  </div>
                ))}
              </details>
              <h3>Related projects ({related.length})</h3>
              {related.map(({ project, reasons }) => (
                <button
                  type="button"
                  className="related-detail"
                  key={project.id}
                  onClick={() => setProjectId(project.id)}
                >
                  <strong>
                    {project.name}{" "}
                    <UiIcon name="arrowRight" className="action-icon" />
                  </strong>
                  <small>{reasons.join(" · ")}</small>
                </button>
              ))}
              {!related.length && <p className="muted">No related projects.</p>}
            </div>
            <div className="drawer-footer">
              <button
                onClick={() => {
                  setConnectionId(selected.id);
                  projectDialog.current?.close();
                  onMode("connections");
                }}
              >
                View in map
              </button>
              <button
                className="primary"
                onClick={() => {
                  const p = selected;
                  projectDialog.current?.close();
                  onEdit(p);
                }}
              >
                Edit project
              </button>
            </div>
          </div>
        )}
      </dialog>
      {peopleRequest && (
        <PeopleDialog
          plan={plan}
          request={peopleRequest}
          busy={busy}
          onSave={onSave}
          onClose={() => setPeopleRequest(null)}
        />
      )}
    </div>
  );
  function renderTree(
    managerId: string | null,
    visited: Set<string>,
  ): React.ReactNode {
    return (
      <ul className="reporting-tree">
        {plan.people
          .filter((p) => p.managerId === managerId && !visited.has(p.id))
          .map((p) => {
            const children = plan.people.filter((r) => r.managerId === p.id);
            return (
              <li key={p.id}>
                <div
                  className={
                    "tree-person" + (dropTarget === p.id ? " drop-ready" : "")
                  }
                  onDragOver={(event) => {
                    if (canDrop(p.id)) {
                      event.preventDefault();
                      event.stopPropagation();
                      setDropTarget(p.id);
                    }
                  }}
                  onDragLeave={(event) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    )
                      setDropTarget(null);
                  }}
                  onDrop={(event) => dropPerson(event, p.id)}
                >
                  <button
                    className="quiet-link drag-person"
                    disabled={busy}
                    draggable={!busy}
                    aria-label={"Move " + p.name}
                    title="Drag onto a manager, or select to move"
                    onClick={() =>
                      setPeopleRequest({ kind: "move", personId: p.id })
                    }
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", p.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedId(p.id);
                    }}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDropTarget(null);
                    }}
                  >
                    <UiIcon name="grip" className="action-icon" />
                  </button>
                  <span
                    className={
                      "person-avatar " +
                      (children.length ? "" : "member-avatar")
                    }
                  >
                    {initials(p.name)}
                  </span>
                  <button onClick={() => openLeader(p.id)}>
                    <strong>{p.name}</strong>
                    <span>
                      {p.title || labels[p.craft]}
                      {p.team ? ` · ${p.team}` : ""}
                    </span>
                  </button>
                  <span className="tree-project-count">
                    {
                      leaderProjects({ ...plan, initiatives: period }, p.id)
                        .length
                    }{" "}
                    projects
                  </span>
                  <div className="tree-actions">
                    <button
                      className="quiet-link"
                      disabled={busy}
                      aria-label={"Add direct report to " + p.name}
                      onClick={() => openPerson(undefined, p.id)}
                    >
                      <UiIcon name="plus" className="action-icon" /> Report
                    </button>
                    <button
                      className="quiet-link"
                      disabled={busy}
                      aria-label={"Edit " + p.name}
                      onClick={() => openPerson(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="quiet-link"
                      disabled={busy}
                      aria-label={"Change manager for " + p.name}
                      onClick={() =>
                        setPeopleRequest({ kind: "move", personId: p.id })
                      }
                    >
                      Move
                    </button>
                  </div>
                </div>
                {children.length > 0 && (
                  <details open={managerId === null}>
                    <summary>{children.length} direct reports</summary>
                    {renderTree(p.id, new Set([...visited, p.id]))}
                  </details>
                )}
              </li>
            );
          })}
      </ul>
    );
  }
}

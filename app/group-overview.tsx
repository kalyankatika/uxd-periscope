"use client";
import UiIcon from "./ui-icon";
import { useRef, useState } from "react";
import { crafts, labels, type Initiative, type Plan } from "@/lib/domain";
import { capacity, level, utilization, weeks } from "@/lib/capacity";
import { allocations } from "@/lib/allocate";
const deliveryLabels: Record<Initiative["delivery"], string> = {
  planned: "Planned",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};
const number = (n: number) => n.toFixed(2).replace(/0$/, "");
const date = (d: string) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
const rate = (i: Initiative) =>
  Object.values(i.effort).reduce((a, b) => a + b, 0);
export default function GroupOverview({
  plan,
  start,
  end,
  onEdit,
  onCapacity,
}: {
  plan: Plan;
  start: string;
  end: string;
  onEdit: (i: Initiative) => void;
  onCapacity: () => void;
}) {
  const [search, setSearch] = useState(""),
    [delivery, setDelivery] = useState("all"),
    [priority, setPriority] = useState("all"),
    [grouped, setGrouped] = useState(true),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const details = useRef<HTMLDialogElement>(null);
  const projects = plan.initiatives.filter(
    (i) => i.start <= end && i.end >= start,
  );
  const selected = plan.initiatives.find((i) => i.id === selectedId);
  const priorities = [
    ...new Set(projects.map((i) => i.priority || "Unassigned priority")),
  ].sort();
  const filtered = projects.filter(
    (i) =>
      (delivery === "all" || i.delivery === delivery) &&
      (priority === "all" ||
        (i.priority || "Unassigned priority") === priority) &&
      [i.name, i.priority, i.owner, i.summary]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const ws = weeks(start, end),
    available = capacity(plan.people, [start]);
  const committed = projects
    .filter((i) => i.status === "committed")
    .map((i) => ({
      ...i,
      start: i.start < start ? start : i.start,
      end: i.end > end ? end : i.end,
    }));
  const committedAllocations = allocations(committed, ws);
  const demand = new Map<string, number>();
  for (const a of committedAllocations) {
    const k = a.craft + ":" + a.weekStart;
    demand.set(k, (demand.get(k) || 0) + a.fte);
  }
  const open = (i: Initiative) => {
    setSelectedId(i.id);
    details.current?.showModal();
  };
  const groups = grouped
    ? [
        ...new Set(filtered.map((i) => i.priority || "Unassigned priority")),
      ].sort()
    : ["All projects"];
  return (
    <div className="group-overview">
      <section
        className="metrics group-metrics"
        aria-label="Group work summary"
      >
        <article>
          <p>Projects in the quarter</p>
          <strong>{projects.length}</strong>
          <span>
            {projects.filter((i) => i.status === "committed").length} committed
            · {projects.filter((i) => i.status === "proposed").length} proposed
          </span>
        </article>
        <article>
          <p>In progress</p>
          <strong>
            {projects.filter((i) => i.delivery === "in_progress").length}
          </strong>
          <span>Reported delivery status</span>
        </article>
        <article
          className={
            projects.some((i) => i.delivery === "blocked") ? "risk-metric" : ""
          }
        >
          <p>Blocked projects</p>
          <strong>
            {projects.filter((i) => i.delivery === "blocked").length}
          </strong>
          <span>
            {priorities.filter((p) => p !== "Unassigned priority").length}{" "}
            strategic priorities represented
          </span>
        </article>
      </section>
      <section className="panel work-panel">
        <div className="panel-head">
          <div>
            <h2>Where the group’s effort goes</h2>
            <p>
              Committed allocation across the selected quarter. Select a craft
              to inspect capacity.
            </p>
          </div>
        </div>
        <div className="craft-overview">
          {crafts.map((c) => {
            const list = committed.filter((i) => i.effort[c] > 0),
              load = ws.map((w) => demand.get(c + ":" + w) || 0),
              cap = available.find((a) => a.craft === c)!.availableFte,
              peak = Math.max(0, ...load),
              total = load.reduce((a, b) => a + b, 0),
              ratio = utilization(peak, cap);
            return (
              <button key={c} className="craft-card" onClick={onCapacity}>
                <span>
                  {labels[c]}{" "}
                  <span aria-hidden="true">
                    <UiIcon name="arrowUpRight" className="action-icon" />
                  </span>
                </span>
                <strong>
                  {number(total)} <small>FTE-weeks</small>
                </strong>
                <span className={"craft-peak " + level(ratio)}>
                  {Number.isFinite(ratio)
                    ? Math.round(ratio * 100) + "% peak"
                    : "Demand without capacity"}
                </span>
                <small>
                  {list.length} projects · {number(cap)} FTE available / week
                </small>
              </button>
            );
          })}
        </div>
      </section>
      <section className="panel projects-panel">
        <div className="panel-head">
          <div>
            <h2>Priorities & projects</h2>
            <p>
              Open a project to see its focus, lead, timeline, and allocation.
            </p>
          </div>
          <div className="view-switch" aria-label="Project grouping">
            <button aria-pressed={grouped} onClick={() => setGrouped(true)}>
              By priority
            </button>
            <button aria-pressed={!grouped} onClick={() => setGrouped(false)}>
              All projects
            </button>
          </div>
        </div>
        <div className="project-filters">
          <label className="search-field">
            Find work
            <input
              type="search"
              placeholder="Search projects, priorities, or leads"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Delivery status
            <select
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
            >
              <option value="all">All statuses</option>
              {Object.entries(deliveryLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">All priorities</option>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <span>
            {filtered.length} of {projects.length} projects
          </span>
        </div>
        {groups.map((group) => {
          const items = grouped
            ? filtered.filter(
                (i) => (i.priority || "Unassigned priority") === group,
              )
            : filtered;
          return (
            <details className="priority-group" open key={group}>
              <summary>
                <span>{group}</span>
                <span>
                  {items.length} projects ·{" "}
                  {items.filter((i) => i.delivery === "in_progress").length} in
                  progress
                </span>
              </summary>
              {group === "Unassigned priority" && (
                <p className="unassigned-note">
                  Assign a strategic priority in project details to connect this
                  work to the group’s goals.
                </p>
              )}
              <div className="table-scroll">
                <table className="project-table">
                  <thead>
                    <tr>
                      <th>Project / focus</th>
                      <th>Lead</th>
                      <th>Delivery</th>
                      <th>Commitment</th>
                      <th>Dates</th>
                      <th>Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => open(i)}
                          >
                            {i.name}{" "}
                            <span aria-hidden="true">
                              <UiIcon
                                name="arrowUpRight"
                                className="action-icon"
                              />
                            </span>
                          </button>
                          <small>
                            {i.summary || "No outcome or current focus added"}
                          </small>
                        </td>
                        <td>{i.owner || "Unassigned"}</td>
                        <td>
                          <span className={"delivery-tag " + i.delivery}>
                            {deliveryLabels[i.delivery]}
                          </span>
                        </td>
                        <td>
                          <span className={"badge " + i.status}>
                            {i.status}
                          </span>
                        </td>
                        <td>
                          {date(i.start)}
                          <small>to {date(i.end)}</small>
                        </td>
                        <td>
                          <strong>{number(rate(i))} FTE</strong>
                          <small>
                            {crafts.filter((c) => i.effort[c] > 0).length}{" "}
                            crafts · full-week rate
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
        {!filtered.length && (
          <div className="empty">
            <p>No projects match this view.</p>
            <button
              onClick={() => {
                setSearch("");
                setDelivery("all");
                setPriority("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <dialog
        ref={details}
        className="drawer project-details"
        aria-labelledby="project-detail-title"
        onClose={() => setSelectedId(null)}
      >
        {selected && (
          <div className="detail-content">
            <div className="panel-head">
              <div>
                <p className="eyebrow">PROJECT OVERVIEW</p>
                <h2 id="project-detail-title">{selected.name}</h2>
              </div>
              <button
                aria-label="Close project details"
                onClick={() => details.current?.close()}
              >
                <UiIcon name="close" className="action-icon" />
              </button>
            </div>
            <div className="drawer-body">
              <div className="detail-badges">
                <span className={"delivery-tag " + selected.delivery}>
                  {deliveryLabels[selected.delivery]}
                </span>
                <span className={"badge " + selected.status}>
                  {selected.status}
                </span>
              </div>
              <h3>Outcome & current focus</h3>
              <p>
                {selected.summary ||
                  "Add an outcome and current focus so the group can understand this work."}
              </p>
              <dl className="project-facts">
                <div>
                  <dt>Strategic priority</dt>
                  <dd>{selected.priority || "Unassigned priority"}</dd>
                </div>
                <div>
                  <dt>Project lead</dt>
                  <dd>{selected.owner || "Unassigned"}</dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{date(selected.start)}</dd>
                </div>
                <div>
                  <dt>End</dt>
                  <dd>{date(selected.end)}</dd>
                </div>
              </dl>
              <h3>Allocation by craft</h3>
              <p className="muted">
                {number(rate(selected))} FTE per full week across the project’s
                date range. Partial weeks are prorated in the capacity view.
              </p>
              {crafts.map((c) => {
                const cap = available.find((a) => a.craft === c)!.availableFte;
                return (
                  <div className="project-allocation" key={c}>
                    <div>
                      <strong>{labels[c]}</strong>
                      <span>{number(selected.effort[c])} FTE / week</span>
                    </div>
                    <meter
                      min={0}
                      max={Math.max(cap, selected.effort[c], 0.01)}
                      value={selected.effort[c]}
                      aria-label={`${labels[c]} project allocation`}
                    />
                    <small>{number(cap)} FTE available across the craft</small>
                  </div>
                );
              })}
              <p className="allocation-note">
                Craft allocations describe required effort. They do not identify
                individual assignments.
              </p>
              <button
                onClick={() => {
                  details.current?.close();
                  onCapacity();
                }}
              >
                View group capacity{" "}
                <UiIcon name="arrowRight" className="action-icon" />
              </button>
            </div>
            <div className="drawer-footer">
              <button
                className="primary"
                onClick={() => {
                  const project = selected;
                  details.current?.close();
                  onEdit(project);
                }}
              >
                Edit project details
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

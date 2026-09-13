"use client";
import UiIcon from "./ui-icon";
import { useEffect, useRef, useState } from "react";
import Leadership from "./leadership";
import { leadershipDemo, isStarterPlan } from "@/lib/leadership-demo";
import { planSchema } from "@/lib/domain";
import {
  crafts,
  labels,
  initiativeSchema,
  type Initiative,
  type Plan,
} from "@/lib/domain";
import { capacity, level, utilization, weeks } from "@/lib/capacity";
import { allocations } from "@/lib/allocate";
import {
  inspectCsv,
  exportCsv,
  type CsvInspection,
  type ImportKind,
} from "@/lib/csv";
import ImportReview from "./import-review";
import WorkspaceImport from "./workspace-import";

const viewLabels = {
  connections: "Work map",
  overview: "Overview",
  teams: "Teams & reporting",
  compare: "Projects",
  capacity: "Capacity",
  cutline: "Project plan",
  people: "People & imports",
};
const viewDescriptions = {
  connections: "People, projects, priorities, and their relationships.",
  overview: "Project status, top priorities, and items requiring attention.",
  teams: "Reporting structure and team projects.",
  compare: "Filter, sort, and compare projects.",
  capacity: "Weekly project demand and available team capacity.",
  cutline:
    "Committed, proposed, and backlog projects for the selected quarter.",
  people: "Import and export planning data. Review team capacity.",
};

function download(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const pct = (n: number) =>
  Number.isFinite(n) ? Math.round(n * 100) + "%" : "No capacity";
const fte = (n: number) => n.toFixed(2).replace(/0$/, "");
const dateLabel = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
export default function Planner({ initial }: { initial: Plan }) {
  const [workspace, setWorkspace] = useState(initial),
    [example, setExample] = useState(leadershipDemo),
    [useExample, setUseExample] = useState(() => isStarterPlan(initial)),
    [quarter, setQuarter] = useState("2026-10-01"),
    [whatIf, setWhatIf] = useState(false),
    [homeVersion, setHomeVersion] = useState(0),
    [view, setView] = useState<
      | "overview"
      | "teams"
      | "compare"
      | "connections"
      | "capacity"
      | "cutline"
      | "people"
    >("connections"),
    [draft, setDraft] = useState<Initiative | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [pendingImport, setPendingImport] = useState<{
      fileName: string;
      kind: ImportKind;
      replace: boolean;
      inspection: CsvInspection;
    } | null>(null);
  const plan = useExample ? example : workspace;
  const navigation = useRef<HTMLElement>(null);
  const pageHeader = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = pageHeader.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--page-header-height",
        `${header.getBoundingClientRect().height + 12}px`,
      );
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--page-header-height");
    };
  }, []);

  const dialog = useRef<HTMLDialogElement>(null),
    [replaceImport, setReplaceImport] = useState(false),
    [importKind, setImportKind] = useState<"people" | "initiatives">("people"),
    file = useRef<HTMLInputElement>(null);
  const endDate = new Date(quarter + "T00:00:00Z");
  endDate.setUTCMonth(endDate.getUTCMonth() + 3);
  endDate.setUTCDate(0);
  const end = endDate.toISOString().slice(0, 10),
    ws = weeks(quarter, end);
  const scenario = plan.initiatives.map((i) =>
    draft?.id === i.id ? draft : i,
  );
  if (draft && !scenario.some((i) => i.id === draft.id)) scenario.push(draft);
  const selected = scenario.filter(
    (i) => i.status === "committed" || (whatIf && i.status === "proposed"),
  );
  // Clip demand to quarter while showing the full weekly capacity baseline.
  const active = selected
    .filter((i) => i.end >= quarter && i.start <= end)
    .map((i) => ({
      ...i,
      start: i.start < quarter ? quarter : i.start,
      end: i.end > end ? end : i.end,
    }));
  const caps = capacity(plan.people, ws),
    alloc = allocations(active, ws);
  const demandByCell = new Map<string, number>();
  for (const a of alloc) {
    const key = a.craft + ":" + a.weekStart;
    demandByCell.set(key, (demandByCell.get(key) || 0) + a.fte);
  }
  const cells = caps.map((c) => {
    const demand = demandByCell.get(c.craft + ":" + c.weekStart) || 0;
    return { ...c, demand, ratio: utilization(demand, c.availableFte) };
  });
  const overloaded = cells.filter((c) => level(c.ratio) === "red"),
    peak = [...cells].sort((a, b) => b.ratio - a.ratio)[0];
  const totalCapacity = capacity(plan.people, [quarter]).reduce(
    (s, c) => s + c.availableFte,
    0,
  );
  async function persist(next: Plan) {
    const valid = planSchema.safeParse(next);
    if (!valid.success) {
      setError(valid.error.issues.map((i) => i.message).join("; "));
      return false;
    }
    if (useExample) {
      setExample(valid.data);
      setNotice("Example updated for this session.");
      return true;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setWorkspace(data);
      setNotice("Plan saved.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function edit(i?: Initiative) {
    setError("");
    setDraft(
      i
        ? structuredClone(i)
        : {
            id: crypto.randomUUID(),
            name: "",
            leadId: null,
            memberIds: [],
            dependsOn: [],
            importance: "normal",
            health: "not_reported",
            decision: "",
            update: "",
            priority: "",
            owner: "",
            summary: "",
            delivery: "planned",
            start: quarter,
            end,
            status: "proposed",
            effort: { design: 0, research: 0, content: 0, design_eng: 0 },
          },
    );
    dialog.current?.showModal();
  }
  async function saveDraft() {
    const parsed = initiativeSchema.safeParse(draft);
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((x) => x.path.join(".") + " " + x.message)
          .join("; "),
      );
      return;
    }
    const next = plan.initiatives.some((i) => i.id === parsed.data.id)
      ? plan.initiatives.map((i) => (i.id === parsed.data.id ? parsed.data : i))
      : [...plan.initiatives, parsed.data];
    if (await persist({ ...plan, initiatives: next })) {
      dialog.current?.close();
      setDraft(null);
    }
  }
  const inQuarter = plan.initiatives.filter(
    (i) => i.end >= quarter && i.start <= end,
  );
  return (
    <div className={`shell ${view === "connections" ? "graph-page" : ""}`}>
      <aside className="rail">
        <a
          className="brand"
          href="/"
          aria-label="Periscope home"
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            setView("connections");
            navigation.current?.scrollTo({ left: 0, behavior: "auto" });
            setHomeVersion((version) => version + 1);
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        >
          <svg
            className="brand-icon"
            viewBox="0 0 28 28"
            width="28"
            height="28"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              cx="14"
              cy="14"
              r="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="10" fill="currentColor" />
          </svg>
          <span className="brand-name">periscope</span>
          <span className="brand-tag">
            <span>UXD</span>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav ref={navigation} aria-label="Main navigation">
          {(
            [
              "connections",
              "overview",
              "teams",
              "compare",
              "capacity",
              "cutline",
              "people",
            ] as const
          ).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                window.scrollTo({ top: 0, behavior: "auto" });
              }}
              title={viewLabels[v]}
              className={view === v ? "nav active" : "nav"}
              aria-current={view === v ? "page" : undefined}
            >
              <UiIcon name={v} />
              <span className="nav-label">{viewLabels[v]}</span>
            </button>
          ))}
        </nav>
        <div className="rail-note">
          <span className="live-dot" /> Leadership workspace
          <p>UXD · {plan.people.length} people</p>
          <small>
            {useExample ? "Example data · Session only" : "Saved workspace"}
          </small>
        </div>
      </aside>
      <main>
        <div className="content">
          <header
            className="page-header"
            ref={pageHeader}
            aria-label="Page header"
          >
            <div className="example-banner">
              <span>
                {useExample
                  ? "Example data · Fictional organization · Changes are temporary"
                  : "Saved workspace · Changes apply to all local sessions"}
              </span>
              <button
                onClick={() => {
                  setUseExample(!useExample);
                  setNotice("");
                  setError("");
                }}
              >
                {useExample ? "Open workspace" : "Use example data"}
              </button>
            </div>
            <div className="title-row">
              <div>
                <h1>{viewLabels[view]}</h1>
                <p className="subtitle">{viewDescriptions[view]}</p>
              </div>
              <div className="actions">
                {(view === "capacity" ||
                  view === "cutline" ||
                  view === "people") && (
                  <button
                    onClick={() =>
                      download(
                        "capacity-review.csv",
                        exportCsv(
                          cells.map((c) => ({
                            scenario: whatIf
                              ? "Committed + proposed"
                              : "Committed",
                            craft: c.craft,
                            weekStart: c.weekStart,
                            availableFte: c.availableFte,
                            allocatedFte: c.demand,
                            utilization: pct(c.ratio),
                            status: level(c.ratio),
                          })),
                        ),
                      )
                    }
                  >
                    ↓ Export review
                  </button>
                )}
                <button className="primary" onClick={() => edit()}>
                  ＋ Add project
                </button>
              </div>
            </div>
          </header>
          <div className="toolbar">
            <label>
              Planning period{" "}
              <input
                aria-label="Planning quarter"
                type="month"
                value={quarter.slice(0, 7)}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m] = e.target.value.split("-").map(Number);
                    setQuarter(
                      `${y}-${String(Math.floor((m - 1) / 3) * 3 + 1).padStart(2, "0")}-01`,
                    );
                  }
                }}
              />
            </label>
            {["capacity", "cutline"].includes(view) && (
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={whatIf}
                  onChange={(e) => setWhatIf(e.target.checked)}
                />
                <span>Include proposed</span>
                <small>What-if scenario</small>
              </label>
            )}
          </div>
          {error && !draft && (
            <div className="message error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="message" role="status">
              {notice}
            </div>
          )}
          {["capacity", "cutline"].includes(view) && (
            <section className="metrics" aria-label="Quarter summary">
              <article>
                <p>Available capacity</p>
                <strong>
                  {fte(totalCapacity)} <small>FTE / week</small>
                </strong>
                <span>After non-project commitments</span>
              </article>
              <article>
                <p>Committed projects</p>
                <strong>
                  {inQuarter
                    .filter((i) => i.status === "committed")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <span>
                  {inQuarter.filter((i) => i.status === "proposed").length}{" "}
                  proposed ·{" "}
                  {inQuarter.filter((i) => i.status === "stretch").length} in
                  backlog
                </span>
              </article>
              <article className={overloaded.length ? "risk-metric" : ""}>
                <p>Weeks above capacity</p>
                <strong>
                  {new Set(overloaded.map((c) => c.weekStart)).size
                    .toString()
                    .padStart(2, "0")}{" "}
                  <small>of {ws.length}</small>
                </strong>
                <span>
                  {overloaded.length
                    ? `${new Set(overloaded.map((c) => c.craft)).size} disciplines over capacity`
                    : "All disciplines within capacity"}
                </span>
              </article>
            </section>
          )}
          {["overview", "teams", "compare", "connections"].includes(view) && (
            <Leadership
              key={`${useExample}:${homeVersion}`}
              plan={plan}
              start={quarter}
              end={end}
              mode={view as "overview" | "teams" | "compare" | "connections"}
              onEdit={edit}
              onSave={persist}
              onMode={setView}
              busy={busy}
            />
          )}
          {view === "capacity" && (
            <>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Allocation by discipline</h2>
                    <p>Weekly demand as a share of available capacity</p>
                  </div>
                  <div className="legend">
                    <span>
                      <i className="green" />
                      ≤80%
                    </span>
                    <span>
                      <i className="amber" />
                      81–100%
                    </span>
                    <span>
                      <i className="red" />
                      &gt;100%
                    </span>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="heatmap">
                    <thead>
                      <tr>
                        <th>DISCIPLINE / AVAILABLE</th>
                        {ws.map((w) => (
                          <th key={w}>{dateLabel(w)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {crafts.map((c) => (
                        <tr key={c}>
                          <th>
                            {labels[c]}
                            <small>
                              {fte(
                                caps.find((x) => x.craft === c)!.availableFte,
                              )}{" "}
                              FTE / week
                            </small>
                          </th>
                          {cells
                            .filter((x) => x.craft === c)
                            .map((x) => (
                              <td key={x.weekStart}>
                                <div
                                  tabIndex={0}
                                  className={"heat " + level(x.ratio)}
                                  title={`${labels[c]}, ${dateLabel(x.weekStart)}: ${fte(x.demand)} allocated / ${fte(x.availableFte)} available FTE`}
                                  aria-label={`${labels[c]}, week of ${dateLabel(x.weekStart)}: ${pct(x.ratio)}, ${fte(x.demand)} allocated of ${fte(x.availableFte)} FTE${level(x.ratio) === "red" ? ", over capacity" : ""}`}
                                >
                                  {pct(x.ratio)}
                                </div>
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="panel-foot">
                  {whatIf
                    ? "Scenario includes committed and proposed projects."
                    : "Showing committed projects only."}{" "}
                  Backlog projects are excluded. Partial weeks use working days.
                </div>
              </section>
              <div className={overloaded.length ? "insight danger" : "insight"}>
                <div className="insight-icon">
                  {overloaded.length ? "!" : "✓"}
                </div>
                <div>
                  <strong>
                    {overloaded.length
                      ? `${labels[peak.craft]} reaches ${pct(peak.ratio)} of capacity`
                      : "Capacity available"}
                  </strong>
                  <p>
                    {overloaded.length
                      ? `Peak week: ${dateLabel(peak.weekStart)}. Reduce effort, move dates, or add capacity before taking on more work.`
                      : "Include proposed projects to review their capacity requirements."}
                  </p>
                </div>
                <button onClick={() => setView("cutline")}>
                  View project plan →
                </button>
              </div>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>
                      Projects this quarter{" "}
                      <span className="count">{inQuarter.length}</span>
                    </h2>
                    <p>Select a project to view its allocation.</p>
                  </div>
                </div>
                {initiativeTable(inQuarter)}
              </section>
            </>
          )}
          {view === "cutline" && (
            <div className="cutline">
              {(["committed", "proposed", "stretch"] as const).map((s) => (
                <section className="panel" key={s}>
                  <div className="panel-head">
                    <div>
                      <h2 className="capitalize">
                        {
                          {
                            committed: "Committed",
                            proposed: "Proposed",
                            stretch: "Backlog",
                          }[s]
                        }{" "}
                        <span className="count">
                          {inQuarter.filter((i) => i.status === s).length}
                        </span>
                      </h2>
                      <p>
                        {s === "committed"
                          ? "Included in the baseline plan"
                          : s === "proposed"
                            ? "Included when proposed projects are enabled"
                            : "Excluded from capacity calculations"}
                      </p>
                    </div>
                  </div>
                  {initiativeTable(inQuarter.filter((i) => i.status === s))}
                </section>
              ))}
            </div>
          )}
          {view === "people" && (
            <>
              <WorkspaceImport
                plan={plan}
                example={useExample}
                busy={busy}
                onSave={persist}
              />
              <section className="panel import-panel">
                <h2>Import or export one file</h2>
                <p>
                  Upload a CSV to review column and label mappings before
                  importing. Records merge by ID. Reporting lines and project
                  links are validated before saving.
                </p>
                <div className="actions">
                  <label>
                    Import type{" "}
                    <select
                      value={importKind}
                      onChange={(e) =>
                        setImportKind(
                          e.target.value as "people" | "initiatives",
                        )
                      }
                    >
                      <option value="people">People</option>
                      <option value="initiatives">Projects</option>
                    </select>
                  </label>
                  <label className="scenario-choice">
                    <input
                      type="checkbox"
                      checked={replaceImport}
                      onChange={(e) => setReplaceImport(e.target.checked)}
                    />{" "}
                    Replace all{" "}
                    {importKind === "people" ? "people" : "projects"}
                  </label>
                  <button disabled={busy} onClick={() => file.current?.click()}>
                    ↑ Upload CSV
                  </button>
                  <button
                    onClick={() =>
                      download(
                        importKind + "-sample.csv",
                        importKind === "people"
                          ? exportCsv(leadershipDemo().people)
                          : exportCsv(
                              leadershipDemo().initiatives.map(
                                ({ effort, ...p }) => ({ ...p, ...effort }),
                              ),
                            ),
                      )
                    }
                  >
                    ↓ Sample CSV
                  </button>
                  <button
                    onClick={() =>
                      download(
                        importKind + ".csv",
                        exportCsv(
                          importKind === "people"
                            ? plan.people
                            : plan.initiatives.map(({ effort, ...i }) => ({
                                ...i,
                                ...effort,
                              })),
                        ),
                      )
                    }
                  >
                    ↓ Export {importKind === "people" ? "people" : "projects"}
                  </button>
                </div>
                <input
                  ref={file}
                  hidden
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      if (f.size > 2_000_000)
                        throw new Error("CSV must be under 2 MB");
                      const inspection = inspectCsv(importKind, await f.text());
                      setError("");
                      setPendingImport({
                        fileName: f.name,
                        kind: importKind,
                        replace: replaceImport,
                        inspection,
                      });
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Import failed",
                      );
                    }
                    e.target.value = "";
                  }}
                />
              </section>
              <section className="panel">
                <div className="panel-head">
                  <h2>Team capacity</h2>
                  <button onClick={() => setView("teams")}>
                    Manage people & reporting
                  </button>
                  <span>{plan.people.length} people</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Person</th>
                        <th>Discipline</th>
                        <th>FTE</th>
                        <th>Non-project</th>
                        <th>Available FTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.people.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{labels[p.craft]}</td>
                          <td>{p.fte}</td>
                          <td>{p.nonProjectPct}%</td>
                          <td>{fte(p.fte * (1 - p.nonProjectPct / 100))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          <footer>Periscope · UXD workspace</footer>
        </div>
      </main>
      {pendingImport && (
        <ImportReview
          plan={plan}
          pending={pendingImport}
          busy={busy}
          onCancel={() => setPendingImport(null)}
          onSave={persist}
        />
      )}
      <dialog
        ref={dialog}
        className="drawer"
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
        onClose={() => {
          setDraft(null);
          setError("");
        }}
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveDraft();
            }}
          >
            <div className="panel-head">
              <div>
                <p className="eyebrow">PROJECT DETAILS</p>
                <h2>
                  {plan.initiatives.some((i) => i.id === draft.id)
                    ? "Edit project"
                    : "New project"}
                </h2>
              </div>
              <button
                type="button"
                disabled={busy}
                aria-label="Close project"
                onClick={() => dialog.current?.close()}
              >
                ✕
              </button>
            </div>
            <div className="drawer-body">
              <label>
                Name
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Business priority
                <input
                  value={draft.priority}
                  placeholder="e.g. Client onboarding"
                  onChange={(e) =>
                    setDraft({ ...draft, priority: e.target.value })
                  }
                />
              </label>
              <label>
                Project owner
                <select
                  value={draft.leadId || ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      leadId: e.target.value || null,
                      owner:
                        plan.people.find((p) => p.id === e.target.value)
                          ?.name || draft.owner,
                    })
                  }
                >
                  <option value="">Not assigned</option>
                  {plan.people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.team || p.title || "Team member"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Importance
                <select
                  value={draft.importance}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      importance: e.target.value as Initiative["importance"],
                    })
                  }
                >
                  <option value="top">Top priority</option>
                  <option value="high">High priority</option>
                  <option value="normal">Standard</option>
                </select>
              </label>
              <label>
                Project health
                <select
                  value={draft.health}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      health: e.target.value as Initiative["health"],
                    })
                  }
                >
                  <option value="not_reported">Not reported</option>
                  <option value="on_track">On track</option>
                  <option value="at_risk">At risk</option>
                  <option value="needs_decision">Decision required</option>
                </select>
              </label>
              <label>
                Latest update
                <textarea
                  rows={2}
                  value={draft.update}
                  onChange={(e) =>
                    setDraft({ ...draft, update: e.target.value })
                  }
                />
              </label>
              <label>
                Action required
                <textarea
                  rows={2}
                  value={draft.decision}
                  onChange={(e) =>
                    setDraft({ ...draft, decision: e.target.value })
                  }
                />
              </label>
              <details className="edit-connections">
                <summary>Contributors ({draft.memberIds.length})</summary>
                {plan.people.map((p) => (
                  <label key={p.id}>
                    <input
                      type="checkbox"
                      checked={draft.memberIds.includes(p.id)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          memberIds: e.target.checked
                            ? [...draft.memberIds, p.id]
                            : draft.memberIds.filter((id) => id !== p.id),
                        })
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </details>
              <details className="edit-connections">
                <summary>
                  Project dependencies ({draft.dependsOn.length})
                </summary>
                {plan.initiatives
                  .filter((p) => p.id !== draft.id)
                  .map((p) => (
                    <label key={p.id}>
                      <input
                        type="checkbox"
                        checked={draft.dependsOn.includes(p.id)}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            dependsOn: e.target.checked
                              ? [...draft.dependsOn, p.id]
                              : draft.dependsOn.filter((id) => id !== p.id),
                          })
                        }
                      />
                      {p.name}
                    </label>
                  ))}
              </details>
              <label>
                Expected outcome
                <textarea
                  rows={3}
                  value={draft.summary}
                  onChange={(e) =>
                    setDraft({ ...draft, summary: e.target.value })
                  }
                />
              </label>
              <label>
                Delivery status
                <select
                  value={draft.delivery}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      delivery: e.target.value as Initiative["delivery"],
                    })
                  }
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <div className="date-fields">
                <label>
                  Start
                  <input
                    required
                    type="date"
                    value={draft.start}
                    onChange={(e) =>
                      setDraft({ ...draft, start: e.target.value })
                    }
                  />
                </label>
                <label>
                  End
                  <input
                    required
                    type="date"
                    min={draft.start}
                    value={draft.end}
                    onChange={(e) =>
                      setDraft({ ...draft, end: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Commitment
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as Initiative["status"],
                    })
                  }
                >
                  <option value="proposed">Proposed</option>
                  <option value="committed">Committed</option>
                  <option value="stretch">Backlog</option>
                </select>
              </label>
              <details className="effort-details">
                <summary>Effort & capacity</summary>
                <h3>Weekly effort by discipline</h3>
                <p className="muted">
                  A value of 1 is one person's full week; 0.5 is half their
                  time. Start and end dates are inclusive.
                </p>
                {crafts.map((c) => (
                  <label className="effort" key={c}>
                    {labels[c]}
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.01"
                      required
                      value={draft.effort[c]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          effort: {
                            ...draft.effort,
                            [c]: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </label>
                ))}
                <div className="draft-impact">
                  <label className="scenario-choice">
                    <input
                      type="checkbox"
                      checked={whatIf}
                      onChange={(e) => setWhatIf(e.target.checked)}
                    />{" "}
                    Include proposed in preview
                  </label>
                  <strong>
                    Live preview ·{" "}
                    {whatIf ? "Committed + proposed" : "Committed only"}
                  </strong>
                  <p>
                    {draft.status === "stretch" ||
                    (draft.status === "proposed" && !whatIf)
                      ? "This project is excluded from the current preview. Include proposed work to assess a proposal."
                      : `${overloaded.length} weekly discipline totals exceed capacity.`}
                  </p>
                </div>
              </details>
              {error && (
                <p className="message error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="drawer-footer">
              {plan.initiatives.some((i) => i.id === draft.id) && (
                <button
                  className="delete"
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      window.confirm(`Delete “${draft.name}”?`) &&
                      (await persist({
                        ...plan,
                        initiatives: plan.initiatives
                          .filter((i) => i.id !== draft.id)
                          .map((i) => ({
                            ...i,
                            dependsOn: i.dependsOn.filter(
                              (id) => id !== draft.id,
                            ),
                          })),
                      }))
                    )
                      dialog.current?.close();
                  }}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => dialog.current?.close()}
              >
                Cancel
              </button>
              <button className="primary" disabled={busy} type="submit">
                {busy ? "Saving…" : "Save project"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
  function initiativeTable(items: Initiative[]) {
    return items.length ? (
      <div className="table-scroll">
        <table className="initiatives">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Dates</th>
              <th>Weekly effort</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <button className="text-button" onClick={() => edit(i)}>
                    {i.name}
                  </button>
                </td>
                <td>
                  <span className={"badge " + i.status}>
                    {
                      {
                        committed: "Committed",
                        proposed: "Proposed",
                        stretch: "Backlog",
                      }[i.status]
                    }
                  </span>
                </td>
                <td>
                  {dateLabel(i.start)} — {dateLabel(i.end)}
                </td>
                <td>
                  {fte(Object.values(i.effort).reduce((a, b) => a + b, 0))} FTE
                </td>
                <td>
                  <button aria-label={"Edit " + i.name} onClick={() => edit(i)}>
                    ↗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="empty">
        No projects in this group for the selected quarter.
      </p>
    );
  }
}

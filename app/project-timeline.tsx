"use client";
import { useState } from "react";
import type { Initiative, Plan } from "@/lib/domain";
import { healthLabels } from "@/lib/work-graph";
import "./project-timeline.css";
import { timelinePosition } from "@/lib/timeline";

export default function ProjectTimeline({ plan, projects, start, end, onOpen }: {
  plan: Plan; projects: Initiative[]; start: string; end: string; onOpen: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find(p => p.id === selectedId);
  const groups = [...new Set(projects.map(p => p.priority || "Unaligned work"))].sort();
  const related = selected ? plan.initiatives.filter(p =>
    selected.dependsOn.includes(p.id) || p.dependsOn.includes(selected.id)) : [];
  return <section className="panel project-timeline" aria-label="Project timeline">
    <div className="panel-head"><div><h2>Timeline</h2><p>{start} – {end} · Grouped by priority · Select a project for dependencies</p></div></div>
    <div className="timeline-scroll" role="region" aria-label="Project dates" tabIndex={0}>
      <div className="timeline-scale"><span>Project</span><div><span>{start}</span><span>{end}</span></div></div>
      {groups.map(group => <section key={group}>
        <h3>{group}</h3>
        {projects.filter(p => (p.priority || "Unaligned work") === group).sort((a,b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id)).map(p => {
          const position = timelinePosition(p.start, p.end, start, end);
          if (!position) return null;
          const { left, width } = position;
          return <button key={p.id} className="timeline-row" aria-pressed={selectedId === p.id} onClick={() => setSelectedId(p.id)}>
            <span><strong>{p.name}</strong><small>{p.start} – {p.end}</small></span>
            <span className="timeline-track"><span className={"timeline-bar " + (p.health === "at_risk" || p.health === "needs_decision" ? "attention" : "")}
              style={{left: left + "%", width: width + "%"}}>{p.status}</span></span>
          </button>;
        })}
      </section>)}
      {!projects.length && <p>No projects in this planning period.</p>}
    </div>
    {selected && <div key={selected.id} className="timeline-detail" aria-live="polite" tabIndex={-1} ref={node => { node?.focus(); }}>
      <h3>{selected.name}</h3>
      <p>{healthLabels[selected.health]} · {plan.people.find(p => p.id === selected.leadId)?.name || "Unassigned owner"}</p>
      <button onClick={() => onOpen(selected.id)}>View in map</button>
      <h4>Dependencies</h4>
      {related.length ? related.map(p => <button key={p.id} onClick={() => onOpen(p.id)}>
        {selected.dependsOn.includes(p.id) ? "Depends on" : "Required by"}: {p.name}
        {p.start > end || p.end < start ? " · Outside period" : ""}
      </button>) : <p>No recorded dependencies.</p>}
    </div>}
  </section>;
}

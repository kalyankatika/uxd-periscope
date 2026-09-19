"use client";
import UiIcon from "./ui-icon";

import { useEffect, useMemo, useRef, useState } from "react";
import { crafts, labels, type Person, type Plan } from "@/lib/domain";
import { teamIds } from "@/lib/work-graph";
import {
  movePerson,
  removalImpact,
  removePerson,
  upsertPerson,
} from "@/lib/people-management";

export type PeopleRequest = {
  kind: "add" | "edit" | "move" | "remove";
  personId?: string;
  managerId?: string | null;
};

export default function PeopleDialog({
  plan,
  request,
  busy,
  onSave,
  onClose,
}: {
  plan: Plan;
  request: PeopleRequest;
  busy: boolean;
  onSave: (next: Plan) => Promise<boolean>;
  onClose: () => void;
}) {
  const person = plan.people.find((p) => p.id === request.personId);
  const [mode, setMode] = useState(request.kind);
  const [draft, setDraft] = useState<Person>(() =>
    person
      ? { ...person }
      : {
          id: crypto.randomUUID(),
          name: "",
          title: "",
          team: plan.people.find((p) => p.id === request.managerId)?.team || "",
          managerId: request.managerId || null,
          isLeader: false,
          craft: "design",
          fte: 1,
          nonProjectPct: 20,
        },
  );
  const [managerId, setManagerId] = useState(
    request.managerId !== undefined
      ? request.managerId
      : person?.managerId || null,
  );
  const [reportsTo, setReportsTo] = useState(person?.managerId || null);
  const [projectOwnerId, setProjectOwnerId] = useState<string | null>(null);
  const [adoptTeam, setAdoptTeam] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const locked = busy || saving;
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    if (mode === "remove")
      dialog.current?.querySelector<HTMLHeadingElement>("h2")?.focus();
  }, [mode]);
  const subtree = teamIds(plan.people, draft.id);
  const managers = plan.people
    .filter((p) => !subtree.has(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const personId = person?.id;
  const impact = useMemo(
    () => (personId ? removalImpact(plan, personId) : null),
    [plan, personId],
  );
  const manager = plan.people.find((p) => p.id === managerId);
  const title =
    mode === "add"
      ? "Add person"
      : mode === "edit"
        ? "Edit person"
        : mode === "move"
          ? "Move person"
          : "Remove person";
  const option = (p: Person) => (
    <option key={p.id} value={p.id}>
      {p.name}
      {p.team ? ` · ${p.team}` : ""} ({p.id})
    </option>
  );
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (locked || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const next =
        mode === "remove"
          ? removePerson(plan, draft.id, reportsTo, projectOwnerId)
          : mode === "move"
            ? movePerson(plan, draft.id, managerId, adoptTeam)
            : upsertPerson(plan, draft);
      if (await onSave(next)) dialog.current?.close();
      else
        setError(
          "Could not save. Check the connection or reload if another session changed the workspace.",
        );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update this person.",
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="drawer people-dialog"
      aria-labelledby="people-dialog-title"
      onClose={onClose}
      onCancel={(event) => {
        if (locked) event.preventDefault();
      }}
    >
      <form onSubmit={save}>
        <div className="panel-head">
          <h2 id="people-dialog-title" tabIndex={-1}>
            {title}
          </h2>
          <button
            type="button"
            disabled={locked}
            onClick={() => dialog.current?.close()}
            aria-label="Close person editor"
          >
            <UiIcon name="close" className="action-icon" />
          </button>
        </div>
        <fieldset disabled={locked} className="drawer-body people-fields">
          {(mode === "add" || mode === "edit") && (
            <>
              <label>
                Name
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Role / title
                <input
                  maxLength={120}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </label>
              <label>
                Team
                <input
                  maxLength={120}
                  list="people-team-options"
                  value={draft.team}
                  onChange={(e) => setDraft({ ...draft, team: e.target.value })}
                />
              </label>
              <datalist id="people-team-options">
                {[...new Set(plan.people.map((p) => p.team).filter(Boolean))]
                  .sort()
                  .map((team) => (
                    <option key={team} value={team} />
                  ))}
              </datalist>
              <label>
                Reports to
                <select
                  value={draft.managerId || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, managerId: e.target.value || null })
                  }
                >
                  <option value="">No manager in this workspace</option>
                  {managers.map(option)}
                </select>
              </label>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={draft.isLeader}
                  onChange={(e) =>
                    setDraft({ ...draft, isLeader: e.target.checked })
                  }
                />
                Show as a leader
              </label>
              <label>
                Discipline
                <select
                  value={draft.craft}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      craft: e.target.value as Person["craft"],
                    })
                  }
                >
                  {crafts.map((craft) => (
                    <option key={craft} value={craft}>
                      {labels[craft]}
                    </option>
                  ))}
                </select>
              </label>
              <details className="effort-details">
                <summary>
                  Weekly availability · {Math.round(draft.fte * 100)}% working
                  time
                  {" · "}
                  {Math.round(
                    draft.fte * (1 - draft.nonProjectPct / 100) * 100,
                  )}
                  % of full time available for projects
                </summary>
                <label>
                  Working time (1 = full time)
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="any"
                    required
                    value={draft.fte}
                    onChange={(e) =>
                      setDraft({ ...draft, fte: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Time reserved for other work (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    required
                    value={draft.nonProjectPct}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nonProjectPct: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </details>
              {mode === "edit" && (
                <p className="muted">
                  Changing the manager keeps this person’s reports and project
                  assignments. Use Move to also update team labels for their
                  reporting group.
                </p>
              )}
            </>
          )}
          {mode === "move" && (
            <>
              <div className="people-context">
                <strong>{person?.name}</strong>
                <p>
                  Currently reports to{" "}
                  {plan.people.find((p) => p.id === person?.managerId)?.name ||
                    "no manager in this workspace"}
                  .
                </p>
              </div>
              <label>
                New manager
                <select
                  value={managerId || ""}
                  onChange={(e) => {
                    setManagerId(e.target.value || null);
                    setAdoptTeam(false);
                  }}
                >
                  <option value="">No manager in this workspace</option>
                  {managers.map(option)}
                </select>
              </label>
              {manager && (
                <label className="inline-check">
                  <input
                    type="checkbox"
                    checked={adoptTeam}
                    onChange={(e) => setAdoptTeam(e.target.checked)}
                  />
                  Use{" "}
                  {manager.team
                    ? `the ${manager.team} team`
                    : "the new manager’s empty team label"}{" "}
                  for this person and their reports
                </label>
              )}
              <div className="people-impact">
                <h3>Move summary</h3>
                <p>
                  {subtree.size - 1} people continue reporting through{" "}
                  {person?.name}. Project owners and contributors stay assigned.
                </p>
                <p>
                  {adoptTeam
                    ? `Team labels change for ${subtree.size} people.`
                    : "Existing team labels stay the same."}
                </p>
              </div>
            </>
          )}
          {mode === "remove" && impact && (
            <>
              <div className="people-context">
                <strong>{person?.name}</strong>
                <p>
                  Remove this person from the workspace and its capacity totals.
                </p>
              </div>
              <div className="people-impact">
                <h3>Review affected records</h3>
                <p>
                  {impact.directReports.length} direct reports ·{" "}
                  {impact.ownedProjects.length} owned projects ·{" "}
                  {impact.contributedProjects.length} contributor assignments
                </p>
                {impact.directReports.length > 0 && (
                  <details open>
                    <summary>Direct reports</summary>
                    <ul>
                      {impact.directReports.map((p) => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {impact.ownedProjects.length > 0 && (
                  <details open>
                    <summary>Owned projects</summary>
                    <ul>
                      {impact.ownedProjects.map((p) => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {impact.contributedProjects.length > 0 && (
                  <details>
                    <summary>Contributor assignments to remove</summary>
                    <ul>
                      {impact.contributedProjects.map((p) => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
              {impact.directReports.length > 0 && (
                <label>
                  Move direct reports to
                  <select
                    value={reportsTo || ""}
                    onChange={(e) => setReportsTo(e.target.value || null)}
                  >
                    <option value="">No manager in this workspace</option>
                    {managers.map(option)}
                  </select>
                </label>
              )}
              {impact.ownedProjects.length > 0 && (
                <label>
                  Reassign owned projects to
                  <select
                    value={projectOwnerId || ""}
                    onChange={(e) => setProjectOwnerId(e.target.value || null)}
                  >
                    <option value="">Leave project owner unassigned</option>
                    {plan.people.filter((p) => p.id !== person?.id).map(option)}
                  </select>
                </label>
              )}
              <p className="muted">
                Projects, effort and dependencies remain. This person’s
                contributor assignments are removed. Reports keep their team
                labels and their own reports.
              </p>
            </>
          )}
          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}
        </fieldset>
        <div className="drawer-footer">
          {mode === "edit" && (
            <button
              className="delete"
              type="button"
              disabled={locked}
              onClick={() => {
                setMode("remove");
                setError("");
              }}
            >
              Remove person
            </button>
          )}
          <button
            type="button"
            disabled={locked}
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={mode === "remove" ? "danger-action" : "primary"}
            disabled={locked}
          >
            {locked
              ? "Saving…"
              : mode === "remove"
                ? "Remove person"
                : mode === "move"
                  ? "Move person"
                  : "Save person"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

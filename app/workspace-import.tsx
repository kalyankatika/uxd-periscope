"use client";
import UiIcon from "./ui-icon";

import { useEffect, useMemo, useRef, useState } from "react";
import { inspectCsv, type CsvInspection, type ImportKind } from "@/lib/csv";
import type { Plan } from "@/lib/domain";
import { previewWorkspaceImport } from "@/lib/import-preview";
import ImportMapping from "./import-mapping";

const datasets = [
  { kind: "people", label: "People" },
  { kind: "initiatives", label: "Projects" },
] as const;

type PendingWorkspace = {
  inspections: Record<ImportKind, CsvInspection>;
  names: Record<ImportKind, string>;
  replace: boolean;
};

export default function WorkspaceImport({
  plan,
  example,
  busy,
  onSave,
  onDownloadSample,
}: {
  plan: Plan;
  example: boolean;
  busy: boolean;
  onSave: (next: Plan) => Promise<boolean>;
  onDownloadSample: (kind: ImportKind) => void;
}) {
  const [files, setFiles] = useState<Record<ImportKind, File | null>>({
    people: null,
    initiatives: null,
  });
  const [replace, setReplace] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<PendingWorkspace | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const readingLock = useRef(false);

  async function review() {
    if (readingLock.current || !files.people || !files.initiatives) return;
    readingLock.current = true;
    setReading(true);
    setError("");
    try {
      async function inspect(kind: ImportKind) {
        const file = files[kind]!;
        try {
          if (file.size > 2_000_000) throw new Error("CSV must be under 2 MB.");
          return inspectCsv(kind, await file.text());
        } catch (error) {
          throw new Error(
            `${kind === "people" ? "People" : "Projects"} (${file.name}): ${error instanceof Error ? error.message : "Unable to read CSV."}`,
          );
        }
      }
      const [people, initiatives] = await Promise.all([
        inspect("people"),
        inspect("initiatives"),
      ]);
      setPending({
        inspections: { people, initiatives },
        names: {
          people: files.people.name,
          initiatives: files.initiatives.name,
        },
        replace,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to review files.",
      );
    } finally {
      readingLock.current = false;
      setReading(false);
    }
  }

  return (
    <section className="panel import-panel organization-import">
      <h2>Import organization</h2>
      <p>
        Load people and projects together. Review both files and their connected
        reporting lines, owners, contributors, and dependencies before saving.
      </p>
      <p className="muted">
        {example
          ? "Example imports are temporary and reset on reload. Select Open workspace before importing to save your changes."
          : "Confirmed imports are saved locally and remain after reload."}
      </p>
      <div className="actions">
        {datasets.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            onClick={() => onDownloadSample(kind)}
          >
            <UiIcon name="download" className="action-icon" /> {label} sample
            CSV
          </button>
        ))}
      </div>
      <form
        ref={form}
        onSubmit={(event) => {
          event.preventDefault();
          void review();
        }}
      >
        <fieldset disabled={busy || reading}>
          <legend className="sr-only">Organization CSV files</legend>
          <div className="organization-files">
            {datasets.map(({ kind, label }) => (
              <label key={kind}>
                <strong>{label} CSV</strong>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  required
                  onChange={(event) => {
                    const selected = event.target.files?.[0] || null;
                    setFiles((current) => ({
                      ...current,
                      [kind]: selected,
                    }));
                    setError("");
                  }}
                />
                <span className="muted">
                  {kind === "people"
                    ? "Full roster and reporting structure"
                    : "All projects, including other quarters"}
                </span>
              </label>
            ))}
          </div>
          <div className="actions">
            <label className="organization-mode">
              Import mode
              <select
                value={replace ? "replace" : "merge"}
                onChange={(event) =>
                  setReplace(event.target.value === "replace")
                }
              >
                <option value="merge">Merge by ID</option>
                <option value="replace">Replace people and projects</option>
              </select>
            </label>
            <button
              className="primary"
              type="submit"
              disabled={!files.people || !files.initiatives}
            >
              {reading ? "Reading files…" : "Review organization"}
            </button>
          </div>
        </fieldset>
      </form>
      <p>
        {replace
          ? "Replace removes people and projects omitted from these files."
          : "Merge keeps existing IDs not included in these files and replaces matching records."}{" "}
        Each CSV can be up to 2 MB; the resulting workspace must fit the 2 MB
        save limit. The sample files include fictional records with supported
        columns and labels.
      </p>
      {error && (
        <div className="message error" role="alert">
          {error}
        </div>
      )}
      {pending && (
        <WorkspaceReview
          plan={plan}
          pending={pending}
          example={example}
          busy={busy}
          onClose={() => setPending(null)}
          onSave={async (next) => {
            if (!(await onSave(next))) return false;
            form.current?.reset();
            setFiles({ people: null, initiatives: null });
            setReplace(false);
            return true;
          }}
        />
      )}
    </section>
  );
}

function WorkspaceReview({
  plan,
  pending,
  example,
  busy,
  onClose,
  onSave,
}: {
  plan: Plan;
  pending: PendingWorkspace;
  example: boolean;
  busy: boolean;
  onClose: () => void;
  onSave: (next: Plan) => Promise<boolean>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const saveLock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const preview = useMemo(
    () => previewWorkspaceImport(plan, pending.inspections, pending.replace),
    [plan, pending],
  );
  const locked = busy || saving;
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function confirm() {
    if (saveLock.current || locked || preview.errors.length) return;
    saveLock.current = true;
    setSaving(true);
    setSaveError("");
    try {
      if (await onSave(preview.plan)) onClose();
      else
        setSaveError(
          "Import was not saved. Close this review and check the workspace message before retrying.",
        );
    } catch {
      setSaveError(
        "Import could not be confirmed. Close this review and reload the workspace before retrying.",
      );
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="drawer import-review organization-review"
      aria-labelledby="organization-review-title"
      onCancel={(event) => {
        if (locked) event.preventDefault();
      }}
      onClose={onClose}
    >
      <div className="panel-head">
        <h2 id="organization-review-title">Review organization import</h2>
        <button
          aria-label="Close organization review"
          disabled={locked}
          onClick={onClose}
        >
          <UiIcon name="close" className="action-icon" />
        </button>
      </div>
      <div className="drawer-body">
        {saveError && (
          <div className="message error" role="alert">
            {saveError}
          </div>
        )}
        <p>
          <strong>
            {example ? "Example data · Session only" : "Saved workspace"}
          </strong>
        </p>
        <p className="muted">
          {pending.replace
            ? "Replace people and projects"
            : "Merge both files by ID"}
          .
          {example
            ? " Changes reset on reload."
            : " Both datasets will be saved in one transaction."}
        </p>
        <div className="table-scroll">
          <table className="import-mapping organization-counts">
            <caption>Changes across all dates</caption>
            <thead>
              <tr>
                <th scope="col">Dataset</th>
                <th scope="col">In file</th>
                <th scope="col">New</th>
                <th scope="col">Updated</th>
                <th scope="col">Removed</th>
                <th scope="col">After import</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(({ kind, label }) => (
                <tr key={kind}>
                  <th scope="row">{label}</th>
                  <td>{pending.inspections[kind].rows.length}</td>
                  <td>{preview.counts[kind].added}</td>
                  <td>{preview.counts[kind].updated}</td>
                  <td>{preview.counts[kind].removed}</td>
                  <td>{preview.plan[kind].length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pending.replace && (
          <p className="message">
            People and projects omitted from these files will be removed after
            you confirm.
          </p>
        )}
        {preview.errors.length > 0 ? (
          <div className="message error" role="alert">
            <strong>Resolve these issues before importing</strong>
            <ul>
              {preview.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="message" role="status">
            Both files and all relationship references are valid.
          </p>
        )}
        <p className="muted">
          Review the column mappings, label conversions, and record previews for
          each file. Every row is validated. Person and project IDs are matched
          exactly.
        </p>
        {datasets.map(({ kind, label }) => (
          <details className="organization-file-review" key={kind} open>
            <summary>
              {label} · {pending.names[kind]}
            </summary>
            <ImportMapping inspection={pending.inspections[kind]} />
          </details>
        ))}
      </div>
      <div className="drawer-footer">
        <button disabled={locked} onClick={onClose}>
          Cancel
        </button>
        <button
          className="primary"
          disabled={locked || preview.errors.length > 0}
          onClick={() => void confirm()}
        >
          {locked ? "Importing…" : "Import organization"}
        </button>
      </div>
    </dialog>
  );
}

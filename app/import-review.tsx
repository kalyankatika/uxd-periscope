"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { csvFieldLabels, type CsvInspection, type ImportKind } from "@/lib/csv";
import { previewImport } from "@/lib/import-preview";
import type { Plan } from "@/lib/domain";

export default function ImportReview({
  plan,
  pending,
  busy,
  onCancel,
  onSave,
}: {
  plan: Plan;
  pending: {
    fileName: string;
    kind: ImportKind;
    replace: boolean;
    inspection: CsvInspection;
  };
  busy: boolean;
  onCancel: () => void;
  onSave: (next: Plan) => Promise<boolean>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saveError, setSaveError] = useState("");
  const preview = useMemo(
    () =>
      previewImport(plan, pending.kind, pending.inspection, pending.replace),
    [plan, pending],
  );
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="drawer import-review"
      aria-labelledby="import-review-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onCancel}
    >
      <div className="panel-head">
        <div>
          <p className="eyebrow">CSV IMPORT</p>
          <h2 id="import-review-title">Review import</h2>
        </div>
        <button
          aria-label="Close import review"
          disabled={busy}
          onClick={onCancel}
        >
          ×
        </button>
      </div>
      <div className="drawer-body">
        {saveError && (
          <p className="message error" role="alert">
            {saveError}
          </p>
        )}
        <p>
          <strong>{pending.fileName}</strong>
        </p>
        <p className="muted">
          {pending.inspection.rows.length}{" "}
          {pending.kind === "people" ? "people" : "projects"} ·{" "}
          {pending.replace ? "Replace existing records" : "Merge by record ID"}
        </p>
        <div className="import-counts">
          <span>
            <strong>{preview.added}</strong> new
          </span>
          <span>
            <strong>{preview.updated}</strong> updated
          </span>
          <span>
            <strong>{preview.removed}</strong> removed
          </span>
        </div>
        {preview.errors.length ? (
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
            All rows and relationship references are valid.
          </p>
        )}
        {pending.inspection.ignored.length > 0 && (
          <p className="message">
            Columns excluded from import:{" "}
            {pending.inspection.ignored.join(", ")}
          </p>
        )}
        <h3>Column mapping</h3>
        <p className="muted">
          Recognized column names map to the fields below. Person and project
          relationships use exact IDs.
        </p>
        <table className="import-mapping">
          <thead>
            <tr>
              <th>Source column</th>
              <th>Periscope field</th>
            </tr>
          </thead>
          <tbody>
            {pending.inspection.columns.map((c) => (
              <tr key={c.target}>
                <td>{c.source}</td>
                <td>{csvFieldLabels[c.target] || c.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pending.inspection.conversions.length > 0 && (
          <>
            <h3>Label mapping</h3>
            <p className="muted">
              Recognized labels are converted to the following stored values.
            </p>
            <table className="import-mapping">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Source label</th>
                  <th>Stored value</th>
                </tr>
              </thead>
              <tbody>
                {pending.inspection.conversions.map((c) => (
                  <tr key={`${c.field}:${c.from}`}>
                    <td>{csvFieldLabels[c.field]}</td>
                    <td>{c.from}</td>
                    <td>{c.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <h3>Record preview</h3>
        <table className="import-mapping">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {pending.inspection.rows.slice(0, 5).map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          Showing the first {Math.min(5, pending.inspection.rows.length)}{" "}
          records. All {pending.inspection.rows.length} records will be
          imported.
        </p>
      </div>
      <div className="drawer-footer">
        <button disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button
          className="primary"
          disabled={busy || preview.errors.length > 0}
          onClick={async () => {
            setSaveError("");
            if (await onSave(preview.plan)) onCancel();
            else
              setSaveError(
                "Could not confirm the import. Close this review and check the workspace before retrying.",
              );
          }}
        >
          {busy
            ? "Importing…"
            : `Import ${pending.inspection.rows.length} records`}
        </button>
      </div>
    </dialog>
  );
}

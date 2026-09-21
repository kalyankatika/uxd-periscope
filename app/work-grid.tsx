"use client";

import { useMemo, useState } from "react";
import type { Plan } from "@/lib/domain";
import { buildPriorityMatrix } from "@/lib/priority-matrix";
import "./priority-matrix.css";
import UiIcon from "./ui-icon";
import type { GraphGridItem, GridSort } from "@/lib/graph-grid";

const types = {
  project: "Project",
  leader: "Leader",
  priority: "Priority",
  person: "Team member",
};

export default function WorkGrid({
  items,
  plan,
  total,
  selectedId,
  sort,
  onSort,
  onSelect,
  onReset,
  view: controlledView,
  onView,
}: {
  items: GraphGridItem[];
  plan: Plan;
  total: number;
  selectedId: string | null;
  sort: GridSort;
  onSort: (sort: GridSort) => void;
  onSelect: (id: string) => void;
  onReset: () => void;
  view?: "cards" | "matrix";
  onView?: (view: "cards" | "matrix") => void;
}) {
  const [localView, setLocalView] = useState<"cards" | "matrix">("cards");
  const view = controlledView ?? localView;
  const setView = (next: "cards" | "matrix") => {
    setLocalView(next);
    onView?.(next);
  };
  const [cell, setCell] = useState<{ row: string; column: string } | null>(
    null,
  );
  const matrix = useMemo(
    () =>
      buildPriorityMatrix(
        items.map((item) => item.node),
        plan,
      ),
    [items, plan],
  );
  const activeRow = matrix.rows.find((row) => row.id === cell?.row);
  const activeColumn = matrix.columns.find(
    (column) => column.id === cell?.column,
  );
  const activeCell = activeRow?.cells.find(
    (candidate) => candidate.priorityId === cell?.column,
  );
  return (
    <div className="work-grid">
      <div className="work-grid-toolbar">
        <p role="status">
          {view === "cards"
            ? `${items.length} of ${total} items`
            : `${matrix.projectCount} projects · By accountable leader`}
        </p>
        <div
          className="priority-matrix-switch"
          role="group"
          aria-label="Grid view"
        >
          <button
            aria-pressed={view === "cards"}
            onClick={() => setView("cards")}
          >
            Cards
          </button>
          <button
            aria-pressed={view === "matrix"}
            onClick={() => setView("matrix")}
          >
            Team × priority
          </button>
        </div>
        {view === "cards" && (
          <label>
            Sort by
            <span className="map-select-input">
              <select
                aria-label="Sort grid"
                value={sort}
                onChange={(e) => onSort(e.target.value as GridSort)}
              >
                <option value="type">Type</option>
                <option value="name">Name A–Z</option>
                <option value="connections">Most connections</option>
              </select>
              <UiIcon name="chevronDown" className="map-select-arrow" />
            </span>
          </label>
        )}
      </div>
      <div
        className="work-grid-scroll"
        tabIndex={0}
        role="region"
        aria-label="Work grid"
      >
        {view === "matrix" ? (
          matrix.projectCount ? (
            <div className="priority-matrix">
              <p className="priority-matrix-note">
                Project counts, not allocation. Select a count to view projects.
              </p>
              {activeCell && activeColumn && activeRow && (
                <section
                  className="priority-matrix-detail"
                  aria-label="Projects in selected cell"
                >
                  <div className="priority-matrix-detail-heading">
                    <h3>
                      {activeRow.label} · {activeColumn.label}
                    </h3>
                    <button
                      aria-label="Close selected cell"
                      onClick={() => setCell(null)}
                    >
                      <UiIcon name="close" />
                    </button>
                  </div>
                  <ul>
                    {activeCell.projects.map((project) => (
                      <li key={project.id}>
                        <button
                          aria-pressed={selectedId === project.id}
                          onClick={() => onSelect(project.id)}
                        >
                          {project.label}
                          <UiIcon name="arrowRight" className="action-icon" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <div
                className="priority-matrix-scroll"
                role="region"
                aria-label="Team by priority project counts. Scroll horizontally for more priorities."
                tabIndex={0}
              >
                <table>
                  <caption className="priority-matrix-caption">
                    Team × priority
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Accountable leader</th>
                      {matrix.columns.map((column) => (
                        <th scope="col" key={column.id}>
                          {column.label}
                        </th>
                      ))}
                      <th scope="col">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.rows.map((row) => (
                      <tr key={row.id}>
                        <th scope="row">
                          {row.label}
                          <small>{row.subtitle}</small>
                        </th>
                        {row.cells.map((candidate) => (
                          <td key={candidate.priorityId}>
                            {candidate.projects.length ? (
                              <button
                                aria-label={`${row.label}, ${matrix.columns.find((column) => column.id === candidate.priorityId)?.label}: ${candidate.projects.length} projects. View projects.`}
                                aria-pressed={
                                  cell?.row === row.id &&
                                  cell.column === candidate.priorityId
                                }
                                onClick={() =>
                                  setCell({
                                    row: row.id,
                                    column: candidate.priorityId,
                                  })
                                }
                              >
                                {candidate.projects.length}
                              </button>
                            ) : (
                              <span aria-label="0 projects">—</span>
                            )}
                          </td>
                        ))}
                        <td>
                          {row.cells.reduce(
                            (sum, candidate) => sum + candidate.projects.length,
                            0,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      {matrix.columns.map((column) => (
                        <td key={column.id}>
                          {matrix.rows.reduce(
                            (sum, row) =>
                              sum +
                              (row.cells.find(
                                (candidate) =>
                                  candidate.priorityId === column.id,
                              )?.projects.length || 0),
                            0,
                          )}
                        </td>
                      ))}
                      <td>{matrix.projectCount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="work-grid-empty">
              <h3>No projects in view</h3>
              <p>
                Change the search or filters, or use Cards to browse people and
                priorities.
              </p>
              <button onClick={onReset}>Reset filters</button>
            </div>
          )
        ) : items.length ? (
          <ul className="work-grid-cards">
            {items.map(
              ({
                node,
                contextLabel,
                context,
                description,
                detail,
                health,
                connections,
              }) => (
                <li key={node.id}>
                  <button
                    className="work-grid-card"
                    data-grid-node-id={node.id}
                    aria-label={`${types[node.kind]}: ${node.label}. View details.`}
                    aria-pressed={selectedId === node.id}
                    onClick={() => onSelect(node.id)}
                  >
                    <span className="work-grid-card-top">
                      <span className={`map-kind-tag ${node.kind}`}>
                        {types[node.kind]}
                      </span>
                      {node.top && (
                        <span className="work-grid-top-priority">
                          Top priority
                        </span>
                      )}
                    </span>
                    <strong className="work-grid-name">{node.label}</strong>
                    <span className="work-grid-context">
                      <small>{contextLabel}</small>
                      {context}
                    </span>
                    <span className="work-grid-description">{description}</span>
                    <span className="work-grid-card-meta">
                      {health && (
                        <span
                          className={`work-grid-health ${node.attention ? "attention" : ""} ${health === "Not reported" ? "unreported" : ""}`}
                        >
                          {health}
                        </span>
                      )}
                      <span>{detail}</span>
                    </span>
                    <span className="work-grid-card-footer">
                      <span>
                        {connections}{" "}
                        {connections === 1 ? "connection" : "connections"} in
                        view
                      </span>
                      <span aria-hidden="true">
                        <UiIcon
                          name={selectedId === node.id ? "check" : "arrowRight"}
                          className="action-icon"
                        />
                      </span>
                    </span>
                  </button>
                </li>
              ),
            )}
          </ul>
        ) : (
          <div className="work-grid-empty">
            <h3>No matching items</h3>
            <p>Change the search or filters to show more work.</p>
            <button onClick={onReset}>Reset filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

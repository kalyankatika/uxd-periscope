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
  total,
  selectedId,
  sort,
  onSort,
  onSelect,
  onReset,
}: {
  items: GraphGridItem[];
  total: number;
  selectedId: string | null;
  sort: GridSort;
  onSort: (sort: GridSort) => void;
  onSelect: (id: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="work-grid">
      <div className="work-grid-toolbar">
        <p role="status">
          {items.length} of {total} items
        </p>
        <label>
          Sort by
          <select
            aria-label="Sort grid"
            value={sort}
            onChange={(e) => onSort(e.target.value as GridSort)}
          >
            <option value="type">Type</option>
            <option value="name">Name A–Z</option>
            <option value="connections">Most connections</option>
          </select>
        </label>
      </div>
      <div
        className="work-grid-scroll"
        tabIndex={0}
        role="region"
        aria-label="Work grid"
      >
        {items.length ? (
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

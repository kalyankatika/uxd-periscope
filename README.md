# Periscope — UXD workspace

A local workspace for UXD projects, reporting relationships, business priorities, and capacity. The interface uses Fidelity Sans, green action buttons, and an interactive Work map.

## Install and run

Requires Git and Node.js 22.13 or later, with npm. Validated with Node.js 22.23.2 and npm 10.9.8.

```sh
git clone https://github.com/kalyankatika/uxd-periscope.git
cd uxd-periscope
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). No API keys, external database, or environment file are required. The app opens with fictional example data; **Open workspace** switches to the locally saved workspace.

For a production local build, run `npm run build` then `npm start`. See the [installation guide](docs/installation.md) for configuration, backups, updates, and troubleshooting.

The app binds to `127.0.0.1:3000`. It uses Next.js App Router, React, TypeScript, D3 force layout, and SQLite. This local MVP has no authentication; shared enterprise deployment and source connectors are separate work.

## Views

- **Work map:** switch between an interactive graph and a card grid of people, leaders, projects, and priorities. Both views share filters, selection, connection focus, and the detail panel. Sort grid cards by type, name, or connections; return to the map to explore relationships. Pan, zoom, drag nodes, search, and export JSON-LD.
- **Overview:** top-priority projects, reported issues, and team summaries.
- **Teams & reporting:** reporting tree, direct reports, and deduplicated project rollups across each leader's team.
- **Projects:** searchable comparison grid with team/status filters, sorting, and CSV export.
- **Capacity:** weekly effort against available time by discipline, with optional proposed work.
- **Project plan:** committed, proposed, and backlog projects.
- **People & imports:** CSV mapping review, relationship validation, imports, exports, and team capacity.

## Example and saved data

The example includes 26 fictional people, seven teams, and 13 connected projects. Teams include Product Design, Research & insights, Content design, Design systems, Design Strategy, Innovation, and UX AI. Example edits stay in memory for the current session. **Open workspace** switches to persisted records; **Use example data** switches back.

SQLite stores the saved workspace at `data/planner.sqlite`. Set `DATABASE_PATH` to use another location. Back up with SQLite tooling, or stop the server before copying database and WAL files. Existing databases migrate while preserving records and revision checks. The older 12-person, five-project starter remains the initial saved dataset; it is separate from the leadership example.

## Enterprise imports

See [the source contract and mapping guide](docs/enterprise-data-mapping.md). Uploading a CSV opens a review; nothing is saved until the import is confirmed. The review lists mapped and excluded columns, recognized value conversions, record counts, and validation errors. Invalid relationships or conflicting taxonomy labels block import.

Stable IDs join reporting lines, project owners, contributors, and dependencies. Names are display labels. Import the full people roster before projects that reference it, and include all interdependent projects in the same project upload. Unknown status or discipline labels are rejected rather than inferred.

Files can use canonical field names or recognized friendly headers. Multiple IDs use `|`; dates use ISO `YYYY-MM-DD`. Merge preserves omitted IDs but replaces each imported record. Replace removes omitted records. Optional columns omitted from an imported record use defaults. File limit: 2 MB.

`GET /api/graph` returns the persisted workspace as JSON-LD. The map export button exports the data currently displayed, including the example when selected. No external system is synchronized automatically.

## Capacity rules

Available time is `fte × (1 − nonProjectPct / 100)`. Requested effort is FTE per full working week. Inclusive dates are prorated over Monday–Friday; holidays and individual leave are not modeled. Quarter boundaries clip project demand while retaining the full weekly capacity baseline.

Committed work forms the baseline. Proposed work is added by the scenario toggle; backlog is excluded. Delivery health does not automatically change capacity commitments. Green is ≤80%, amber is >80% through 100%, and red is >100%. A nonzero request with no capacity is over capacity.

## Validation and development

```sh
npm test
npm run typecheck
npm run build
```

Tests cover capacity calculations, CSV and mapping behavior, graph identities and layout, reporting rollups, relationship validation, schema migration, SQLite transactions, and stale writes. See [AGENTS.md](AGENTS.md) for the project's agentic development workflow and [leadership experience notes](docs/leadership-experience.md) for the interaction model.

## Demo

The current [40-second silent demo](artifacts/platform-demo/periscope-overview-demo.mp4) starts with the platform overview before drilling into the map, project connections, grid, team projects, and capacity. The longer narrated recording, captions, and reusable example files are also in `artifacts/platform-demo`. The earlier capacity-only recording remains in `artifacts/demo`.

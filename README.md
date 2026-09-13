# Periscope

A local workspace for projects, reporting relationships, business priorities, and capacity, with UXD as the current example and data model. The interface uses Fidelity Sans, green action buttons, and an interactive Work map.

The active scope is **UXD**: give ELT, the head of UXD and design leaders a clear view of priorities, projects, people and allocation, with enterprise sources and governed manual planning. Keep integration contracts extensible; portfolio-manager use cases are a future possibility. See the [enterprise handoff](docs/enterprise-handoff.md) for the [market and product assessment](docs/enterprise-product-assessment.md), [architecture decision](docs/enterprise-architecture.md), [connector contracts](docs/enterprise-connectors.md), and [build audit](docs/enterprise-build-audit.md). Live connectors, enterprise access controls and time/financial tracking are future work.

## Install and run

Requires Git and Node.js 22.13 or later, with npm. Validated with Node.js 22.23.2 and npm 10.9.8; `.nvmrc` pins that tested Node version. If using nvm, run `nvm install` and `nvm use` after cloning.

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
- **Teams & reporting:** add and edit people, add direct reports, move reporting groups with drag-and-drop or Move, and remove people with report/project reassignment. Each leader shows deduplicated project rollups. See [manual hierarchy controls](docs/enterprise-data-mapping.md#manual-people-and-hierarchy-changes).
- **Projects:** searchable comparison grid with team/status filters, sorting, and CSV export.
- **Capacity:** weekly effort against available time by discipline, with optional proposed work.
- **Project plan:** committed, proposed, and backlog projects.
- **People & imports:** import a complete organization from people and project CSVs in one reviewed save, or update one dataset. Includes mapping review, relationship validation, exports, and team capacity.

## Example and saved data

The example includes 27 fictional people, eight teams, and 13 connected projects. Teams include Product Design, Design Research, Content & Conversation Design, Design Systems & Engineering, Experience Strategy, Emerging Experiences, AI Product Design, and UXD Operations. Example edits stay in memory for the current session. **Open workspace** switches to persisted records; **Use example data** switches back.

SQLite stores the saved workspace at `data/planner.sqlite`. Set `DATABASE_PATH` to use another location. Back up with SQLite tooling, or stop the server before copying database and WAL files. Existing databases migrate while preserving records and revision checks. The older 12-person, five-project starter remains the initial saved dataset; it is separate from the leadership example.

## Enterprise imports

For a portable showcase, use the committed [UXD demo data pack](examples/uxd-demo/README.md): matching people/projects CSVs, canonical workspace JSON, metadata, an isolated-database setup and a five-minute walkthrough. Run `npm run demo:check` to validate the pack. The current UI imports the CSV pair; JSON is included for developer reference and adapter work.

See [the source contract and mapping guide](docs/enterprise-data-mapping.md). Uploading a CSV opens a review; nothing is saved until the import is confirmed. The review lists mapped and excluded columns, recognized value conversions, record counts, and validation errors. Invalid relationships or conflicting taxonomy labels block import.

Stable IDs join reporting lines, project owners, contributors, and dependencies. Names are display labels. **Import organization** reviews both CSVs against their combined result and saves people and projects together. For separate uploads, import the people roster before projects that reference it. Include all interdependent projects in the project file. Unknown status or discipline labels are rejected rather than inferred.

Files can use canonical field names or recognized friendly headers. Multiple IDs use `|`; dates use ISO `YYYY-MM-DD`. Merge preserves omitted IDs but replaces each imported record. Replace removes omitted records, from both datasets for an organization import or from the selected dataset for a single-file import. Optional columns omitted from an imported record use defaults. File limit: 2 MB per CSV; the complete workspace must fit the 2 MB save limit.

`GET /api/graph` returns the persisted workspace as JSON-LD. The map export button exports the data currently displayed, including the example when selected. No external system is synchronized automatically.

## Capacity rules

Available time is `fte × (1 − nonProjectPct / 100)`. Requested effort is FTE per full working week. Inclusive dates are prorated over Monday–Friday; holidays and individual leave are not modeled. Quarter boundaries clip project demand while retaining the full weekly capacity baseline.

Committed work forms the baseline. Proposed work is added by the scenario toggle; backlog is excluded. Delivery health does not automatically change capacity commitments. Green is ≤80%, amber is >80% through 100%, and red is >100%. A nonzero request with no capacity is over capacity.

## Validation and development

```sh
npm run verify
```

`verify` runs type checking, tests and the production build. Tests cover capacity calculations, CSV and mapping behavior, graph identities and layout, reporting rollups, relationship validation, schema migration, SQLite transactions, and stale writes. The [GitHub verification workflow](.github/workflows/verify.yml) runs the same checks on push and pull request. See [clean-build evidence](artifacts/enterprise-handoff/README.md), [AGENTS.md](AGENTS.md) for the project's agentic development workflow and [leadership experience notes](docs/leadership-experience.md) for the interaction model.

For substantial builds, use the [Periscope Manager Loop](docs/manager-loop.md) with its copyable launch and resume prompts. [BUILD_STATE.md](BUILD_STATE.md) records the current objective, verified outcomes, and next action.

## Demo

The current [40-second silent demo](artifacts/platform-demo/periscope-overview-demo.mp4) starts with the platform overview before drilling into the map, project connections, grid, team projects, and capacity. The longer narrated recording, captions, and reusable example files are also in `artifacts/platform-demo`. The earlier capacity-only recording remains in `artifacts/demo`.

## Enterprise distribution

Review the [handoff gates](docs/enterprise-handoff.md#enterprise-release-gates) before shared enterprise use. The current application has no sign-in or record-level authorization. The bundled Fidelity fonts have permission-restricted embedded notices; confirm the intended usage and distribution rights. No root repository license is currently supplied. Saved databases, credentials and real source exports should stay outside source control.

# Related projects — implementation evidence

September 12, 2026. Implements the smallest next improvement recommended in the [UXD utility review](../../docs/utility-review.md). All browser checks use fictional data. No live integrations, staffing model, provenance history or import changes were introduced.

## Delivered behavior

- Project detail lists include every related project, with a visible total and an explicit empty state. The former four-row cap is removed.
- Direct prerequisites/dependents appear before other related projects. Existing labels explain the direction relative to the selected project; a project with multiple reasons appears once.
- Shared people include the union of project lead and contributor IDs on both projects. Names are never identity keys, and holding both roles does not duplicate a relationship reason.
- Related-project navigation opens the selected project at the top of the panel and focuses its heading. It changes selection only, without saving records.
- Fidelity Sans, #368727 actions, rounded buttons, map/grid interactions, dependencies and saved workspace are preserved.

Changed product files: [leadership.tsx](../../app/leadership.tsx), [work-graph.ts](../../lib/work-graph.ts), and [work-graph.test.ts](../../tests/work-graph.test.ts). The current leadership experience documentation and historical utility review link to this follow-up. The prior evaluation handoff is preserved in [prior-build-state.md](prior-build-state.md).

## Verification

| Check | Result and evidence |
| --- | --- |
| Focused regression suite | **19/19 passed** across work-graph, graph-map and graph-grid. Six added tests cover complete ordering beyond four results, all seven dependency edges, opposite participant roles, duplicate roles, distinct IDs with matching names, renames and immutability. [Test log](tests.log) |
| Production build | **Passed**, including TypeScript. Node 22.23.2 / Next 16.3.4. Build-time database path was isolated. [Build log](build.log) |
| All fictional project details | **13/13 passed**. Every rendered row, reason, total and order matches [independent expected relations](expected-relations.json), calculated directly from the raw fictional fixture without product helpers. [Browser result](browser-verification.json) |
| Map/grid/export agreement | Every project's map/grid selected-item connections agree. All **seven dependency edges** are present with correct directions. The entire [downloaded graph](graph-export.jsonld) equals the pre-fix example export. |
| Navigation and keyboard | Mouse activation of Components → AI standards and keyboard activation of Account opening → Retirement guidance open the correct title, focus `lead-project-title`, and reset panel scroll to zero. Full action/output evidence is in [browser-actions.jsonl](browser-actions.jsonl). |
| Data preservation | Isolated saved Plan before/after navigation is equal. The user's saved metadata, people and project rows—including revision—match pre-restart read-only fingerprints. No saved record contents are logged. [Preservation result](preservation-after.json) |
| Current preview | Port **3000** returns HTTP 200 and runs the current production build. [Runtime record](runtime.json), [server log](preview-server.log) |

The [browser replay script](verify-browser.py) uses real DOM observations, native keyboard activation and button clicks through agent-browser on port 3022. It asserts every expected row and connection; it does not read framework state or invoke product helpers. The [logger](browser.py) records snapshots after navigation and scrolls targets into view. The script requires the dedicated fictional browser state and is an evidence/replay utility, not a general-purpose enterprise test runner.

One initial harness selector matched Grid's **View on map** button because both it and **Open project details** use `.map-open-button`. The failed dialog read is retained in the action log. Narrowing the selector to `.primary.map-open-button` targeted the intended control; the complete replay then passed. No product navigation defect was involved.

## Screenshots

- [Unchanged Work map](01-map.png).
- [Components: total and dependents first](02-components-all-relations.png). Additional rows remain accessible by scrolling; the snapshot records all eight.
- [Mouse navigation to AI standards](03-navigation-to-standards.png).
- [Account opening: all eight related projects, including Retirement](opening-complete-details.png).
- [AI research: both prerequisites visible](ai-research-complete-details.png).
- [Keyboard navigation to Retirement](04-keyboard-navigation.png).

The manager visually inspected the map, complete-list screenshots and navigation state. Browser console/error checks were empty. The isolated port-3022 server and its browser session were closed after verification; the user's refreshed port-3000 preview remains running (session 36624). SQLite byte-level files can change during normal restart/checkpointing, so preservation across restart was verified against complete ordered records rather than physical file bytes.

## Limits

This fixes incomplete relationship discovery. It does not calculate schedule impact or critical paths, validate real enterprise source data, add individual project bookings, or provide a freshness/audit history. Real-leader validation remains the next way to assess usefulness; the original review's other gaps remain open. No push or deployment was performed.

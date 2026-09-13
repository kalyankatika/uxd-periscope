# Periscope build state

## Current objective — complete

Implemented the smallest next improvement from the completed UXD utility review: complete and consistent project relationships in the detail panel. The user authorized this increment with “lets build accordingly.” UXD remains the focus; portfolio-manager use cases remain deferred.

Project details now show every related project and the total, with direct prerequisites/dependents first. Shared people include leads and contributors on both projects, joined by authoritative IDs. Related-project navigation resets the panel to the top and focuses the new heading without changing the Plan. The current preview runs at [127.0.0.1:3000](http://127.0.0.1:3000/).

## Completed phases and acceptance

| Phase | Evidence | Status |
| --- | --- | --- |
| Relationship logic | Union of lead/contributor IDs, no name-based joins, complete/deduplicated reasons and dependency-first ordering; six new regressions | Complete |
| Detail panel | Removed four-row cap; all rows and true total shown; empty state; keyed content and heading focus preserve navigation context | Complete |
| Verification | 19 focused tests and production build passed. All 13 fictional detail lists match independent expected rows. Map/grid connection panels agree; all seven dependency edges and the full graph export match. Mouse/keyboard navigation and data preservation checked. | Complete |
| Handoff | [Implementation evidence](artifacts/related-projects/README.md), current leadership documentation and historical review follow-up updated; final diff and local links checked | Complete |

## Changed files

- app/leadership.tsx — complete list/count/empty state, selected-project scroll and heading focus.
- lib/work-graph.ts — complete shared-person matching and direct-dependency ordering.
- tests/work-graph.test.ts — six targeted regressions, including all seven recorded dependency edges, role overlap, duplicate roles, same-name distinct IDs, renames and immutability.
- docs/leadership-experience.md — current behavior documented.
- docs/utility-review.md — historical findings retained with an implementation follow-up link.
- BUILD_STATE.md and artifacts/related-projects — implementation/verification handoff.

Existing local organization-import, research and build-support changes remain preserved. No dependencies, schema, import mapping or graph rendering were changed. No push or deployment was performed.

## Verification details

- Command: node --import tsx --test tests/work-graph.test.ts tests/graph-map.test.ts tests/graph-grid.test.ts — **19/19 passed**. [Log](artifacts/related-projects/tests.log)
- npm run build — **passed**, including TypeScript; Node 22.23.2 / Next 16.3.4. Build-time database access was isolated. [Log](artifacts/related-projects/build.log)
- Native browser keyboard/click interaction on the same production build with a disposable SQLite database on port 3022: **13/13 project lists**, including every row/reason/count/order, and all seven dependency directions across map/grid/detail/export passed. [Result](artifacts/related-projects/browser-verification.json)
- Former omissions verified: Components lists AI standards; AI research lists AI standards; opening and retirement list each other as sharing people across opposite roles. Components → AI standards mouse navigation and opening → retirement keyboard navigation focus the correct heading and reset scroll to zero.
- Browser console/errors empty. The initial verification harness selected View on map instead of Open project details; selector corrected and complete replay passed. This was not a product defect.
- Saved user metadata, people, project records and revision match read-only pre-restart fingerprints. Isolated saved Plan was also unchanged by navigation; full example graph export equals the pre-fix export. Styles and dependencies match baseline hashes. [Preservation](artifacts/related-projects/preservation-after.json)
- Main port-3000 server runs the current production build, session 36624, and returned HTTP 200. The isolated browser and port-3022 server were closed after verification. [Runtime](artifacts/related-projects/runtime.json)

## Delegation and acceptance

related_project_logic owned only the helper and its tests. The manager implemented the detail UI, inspected the agent diff, ran integrated checks and browser interaction, visually inspected screenshots, and verified saved-data preservation. The agent independently reviewed the manager's UI changes and found no concrete correctness issue. The prior handoff is retained in [prior-build-state.md](artifacts/related-projects/prior-build-state.md).

## Remaining scope and next step

This increment repairs relationship discovery; it does not establish schedule impact, freshness history, individual project bookings or enterprise source correctness. The remaining utility-review gaps are source/freshness evidence, person/team staffing constraints, decision ownership/deadlines/closure, and field-level import differences. Live connectors, enterprise authorization/audit history and time/financial models remain unimplemented.

The bounded implementation is complete. Use the [real-leader validation script](docs/utility-review.md#short-validation-script-for-a-real-uxd-leader) on the updated product before selecting the next feature increment. No real-user validation or measured time savings are claimed. Preserve the Next.js/SQLite architecture, saved workspace, Fidelity Sans, #368727 rounded actions and Work map design in subsequent work.

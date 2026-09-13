# Periscope build state

## Current objective — complete

Organization graph now shows direct and nested reports using the fictional four-level Avery → Elena → Maya → Nina fixture. Reporting lines uses a deterministic top-down layout and preserves all descendants when focused. Direct/indirect report lists and project totals are navigable; Grid uses the same scope. CSV/JSON fixtures and mapping documentation are updated.

## Verification and research

Completed an actual live-browser head-of-UXD cognitive walkthrough across reporting, nested projects, priorities, attention, dependencies, capacity, hierarchy changes and repository import/export. This is AI-assisted evaluation, not human participant research. [Task outcomes and limits](docs/head-uxd-research.md); [evidence](artifacts/head-uxd/README.md).

Corrected dimmed grandchildren, compressed reporting levels and misleading node-type filtering. 61 tests, TypeScript and both production builds passed. Actual CSV import matched all records by ID; reload/restart preserved the isolated saved workspace. Full graph export preserved the reporting chain. Original SQLite hashes unchanged.

Main preview runs at http://127.0.0.1:3000/ (production session 78985). Fictional edits remain session-only; saved data preserved. Source and evidence are ready for the authorized GitHub handoff.

## Roles and preserved context

Manager integrated UI/data, ran browser evaluation and verified acceptance. Independent reporting-layout worker supplied the layout/tests; research reviewer supplied an independent protocol/oracle and identified the filtering risk. [Previous completed state](artifacts/head-uxd/prior-build-state.md) retains hierarchy management, demo pack, alignment and enterprise architecture history.

Live connectors, generic JSON browser upload and real participant research are not implemented or claimed. No additional backlog or recurring work was started.

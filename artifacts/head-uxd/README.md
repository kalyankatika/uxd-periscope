# Head-of-UXD browser evaluation

September 12, 2026. AI-assisted cognitive walkthrough using fictional repository data; no human participants or live enterprise synchronization. See [findings and task results](../../docs/head-uxd-research.md).

## Delivered behavior

Work map → Reporting lines shows only people and reporting relationships. Focus includes every descendant. The inspector separates direct and indirect reports and supports navigation to each person and manager. Repository CSV/JSON contain Avery → Elena → Maya → Nina.

## Evidence

- `browser-actions.jsonl` and `browser-logs/`: actual browser actions and observations in execution order.
- `reporting-head.png` / `elena-group.png`: initial visibility problems.
- `reporting-head-final.png` / `elena-group-final.png`: corrected hierarchy, with every descendant visible.
- `mobile-grid.png`: responsive reporting controls at 390×844; DOM width equals viewport.
- `home.png`, `capacity.png`, `preview.png`: platform and main preview checks.
- `imported-plan.json`: fictional CSV import matched to canonical JSON by ID.
- `restart-verification.json`: imported records survived full disposable-server restart.
- `graph.jsonld`, `export-verification.json`: actual downloaded full graph from a focused reporting view.
- `preservation.json`: only hashes of the user's SQLite files; no saved user records captured.
- `tests.log`: 61 tests passed. `build.log` and `preview-build.log`: successful final production builds.

The disposable server used port 3026 and an isolated SQLite path. The current build runs at http://127.0.0.1:3000/ with the original saved workspace. Example edits were temporary. Browser session was closed after verification. Supplemental protocol steps not exercised are explicitly marked in the report.

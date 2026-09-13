# Portable UXD demo data — verification

The [repository demo pack](../../examples/uxd-demo/README.md) contains fictional people/projects CSVs, equivalent canonical workspace JSON and a separate manifest. The source is the existing `leadershipDemo()` fixture, never the user's saved database.

## Results

- **45/45 tests passed**, including three new pack tests for deterministic generation, CSV/JSON/source parity, recognized mappings and independent reporting traversal. Type checking passed. [Verification log](verify.log), [focused data tests](data-tests.log).
- **Production build passed** in a separate copy of the repository using the locked dependencies. [Build log](build.log). The initial sandboxed build stalled at the compile phase with no CPU activity; it was stopped and the build rerun with normal local worker permissions. No application change was needed. The earlier typecheck/test results are retained rather than claimed as an uninterrupted successful `npm run verify` invocation.
- The documented CSV pair was uploaded through **People & imports → Import organization** into an isolated saved starter workspace. Review showed 26 new/12 removed people, 13 new/5 removed projects, zero updated, no excluded columns and valid references. [Review screenshot](02-review.png).
- Confirmed import, reloaded the browser, and then restarted the server. The saved workspace retained **26 people, 13 projects, revision 1**. Every saved field matches `workspace.json` by record ID; its fixture revision is intentionally 0. [Verification result](verification.json), [fictional imported Plan](imported-workspace.json), [after reload](03-imported-after-reload.png).
- The [downloaded graph](imported-graph.jsonld) matches the API graph and all 46 nodes of the established fictional example, preserving ownership, reporting, contributor, priority and dependency links.
- Browser console and error checks were empty. [Action log](browser-actions.jsonl) points to every snapshot and command output. The [browser logger](browser.py) uses a machine-specific agent-browser path and is optional verification tooling, not an enterprise runtime dependency.
- The user's separate saved SQLite files matched their pre-run hashes exactly. The normal port-3000 preview was not restarted or changed. Only the disposable demo database was written.

The copied repository used a temporary directory recorded in [environment.json](environment.json), excluded saved data, local environment files, Git metadata and prior build output, and copied the same locked dependencies without an external `node_modules` symlink. This run did not repeat registry installation. Production startup used the README's database override and port option, with 3023 instead of 3001 to avoid other sessions. The test server and browser were closed after verification; the normal preview remains available.

## Scope

The CSV pair is ready for the existing reviewed importer. JSON is a full Plan reference for developer/adapter work; generic JSON file upload and enterprise API synchronization are not implemented. The dataset is deliberately fixed to Q4 2026; select October 2026 for the walkthrough. The seven functional teams are separate from the head-of-UXD grouping and from the four capacity disciplines.

The data generator and its tests were delegated; the manager reviewed them, authored the setup/walkthrough, verified the actual import/persistence, and prepared the repository handoff. The [prior build state](prior-build-state.md) preserves the completed relationship repair and earlier assessment context.

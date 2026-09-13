# Periscope build state

## Current objective — complete

People can be added to reporting hierarchies, moved between managers and teams, and removed with explicit reassignment of reports and project ownership. The implementation preserves stable IDs, complete projects, example/saved separation, Fidelity Sans, rounded actions and the existing Work map interaction design.

## Completed behavior

- **Teams & reporting → Add person** adds a local UUID-based person. **＋ Report** on a row and **Add direct report** in a leader view prefill manager and team.
- **Edit** updates person fields and availability, including valid decimal capacity values. Existing IDs remain unchanged.
- **Move**, its keyboard-accessible button/handle, or pointer drag-and-drop opens a review. A person keeps all reports and project assignments. Optional team adoption updates the moved person and every descendant. A top-level drop target and manager option remove the reporting link. Self/descendant/missing-manager moves are rejected.
- **Edit → Remove person** reviews direct reports, owned projects and contributor assignments. Only that person is removed. Reports move to the selected manager/top level; owned projects transfer to a surviving owner or become unassigned; removed-person contributor IDs are cleaned up. Project effort, dependencies and other records remain. Unassigned ownership clears misleading legacy owner text.
- **People & imports → Manage people & reporting** links to these controls. Saved changes use the existing revision-checked SQLite transaction; examples remain session-only.

## Verification

All 57 tests pass, including 12 new pure-operation tests. Typecheck and production builds pass. An isolated browser scenario verifies create with decimal availability, actual pointer drag into review, descendant exclusion, subtree/team movement, leader removal/reparenting, project-owner transfer, contributor removal, keyboard top-level move, cancellation, stale-save rejection, reload and full server restart. All 13 projects survive; graph relationships agree with the saved Plan.

Desktop and 390-pixel mobile views were visually checked, including the editor and row controls. No runtime exceptions or framework overlays appeared. Example-only edits left the saved API Plan unchanged. The initial checkpoint assertion was corrected to compare records by ID rather than SQLite row order; no application failure was involved.

The user's database files were unchanged throughout isolated testing. The saved Plan hash also remained identical across the preview restart. Port 3000 runs the current production build (server session 78506). The disposable port-3024 server and dedicated browser are closed.

Evidence: [people-management verification](artifacts/people-management/README.md). Instructions: [manual hierarchy controls](docs/enterprise-data-mapping.md#manual-people-and-hierarchy-changes).

## Delegation and preserved context

The hierarchy_logic agent owned pure helpers and 12 tests, then independently reviewed the UI. The manager owned UI integration, documentation, full-flow browser checks and acceptance. Review found restrictive native number steps, which were fixed while retaining schema bounds.

The [UXD demo pack](examples/uxd-demo/README.md) remains unchanged and verified by the test suite. The prior app/demo handoff was published at a9aee9f; [previous build state](artifacts/people-management/prior-build-state.md) preserves its details. UXD remains the current focus.

## Limits

Moves change reporting relationships, not sibling display ordering or saved graph coordinates. There is no edit history or undo. A later source import can overwrite manual changes by ID. Live connectors, generic JSON upload, access controls, audit history, individual staffing constraints and time/financial models remain future work.

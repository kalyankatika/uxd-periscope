# Import and persistence investigation

Agent evaluation, 2026-09-12. This investigation covers implementation and focused tests. The manager owns browser evidence, the final utility verdict and BUILD_STATE.md. No application files were edited; no server was started, stopped or queried; the user's saved database was not accessed. Test database modules were inspected before execution: each persistence/API/migration test creates its own temporary database and sets `DATABASE_PATH` before importing the database module.

## Fictional scenario supplied for browser evaluation

[Expected results](import-fixtures/expected-results.md) records the oracle prepared before browser testing. [Baseline Plan JSON](import-fixtures/baseline-plan.json) and six CSV files define a five-person, three-project UXD organization and a partial update. The update renames leader **0010 Avery Shah → Avery Chen**, adds **0030 Taylor Brooks**, updates a shared project while preserving its owner/dependency IDs, and adds a proposed UX AI project.

The correct merge result is **6 people, 4 projects**, with each dataset showing **1 New / 1 Updated / 0 Removed**. It preserves a cross-leader shared contributor and stable leading-zero IDs. Invalid files use a missing manager and an unrecognized commitment label. These are relationship and vocabulary checks, not an invented live enterprise integration.

The in-memory [fixture verification](import-fixtures/check-fixtures.ts), run after writing the oracle, passed. It confirms CSV/JSON baseline agreement; update counts and retained omitted rows; renamed owner identity; updated leader rollups with no duplicate projects; excluded-column metadata; invalid manager/status rejection; unsafe subset replacement rejection; CSV round trip; and JSON-LD links. [Result](import-fixtures/check-results.log). This script touches no SQLite database.

## Focused existing tests

Command executed from the repository root:

```sh
node --import tsx --test tests/import-preview.test.ts tests/workspace-import.test.ts tests/workspace-import-api.test.ts tests/persistence.test.ts tests/api.test.ts tests/migration.test.ts tests/work-graph.test.ts tests/graph-map.test.ts tests/graph-grid.test.ts
```

**31 tests passed; 0 failed, skipped or cancelled.** [Full log](focused-tests.log). No build was run by this agent because the assigned work is evaluation and artifact creation, with no functional app change.

| Test area | What passing evidence covers | What it does not establish |
| --- | --- | --- |
| Friendly CSV mappings | Supported source-header aliases, explicit label conversion, leading-zero preservation, ambiguous duplicate columns and unknown labels rejected | Whether a new enterprise source's vocabulary or identity scheme is correct |
| Combined import preview | Merge/replace counts, both datasets validated together, omitted records retained in merge, exact/case-sensitive IDs, reporting cycles, broken owners/contributors/dependencies and taxonomy conflicts blocked | Record-level semantic correctness; all references could point to the wrong but existing IDs |
| Save-size checks | Serialized preview's UTF-8 2 MB boundary, malformed inspected rows | Large-scale operational throughput or browser handling near limits |
| Combined import API | Read-only preview, one revision for two datasets, stable graph identities, stale write rejected, invalid replacement cannot partially change the roster | Browser navigation, source authenticity, live connector behavior or production concurrency |
| SQLite/API persistence | Save and reread, unchanged state after stale/invalid writes, origin check, legacy migration preservation | Authentication, access roles, history/audit trail, source timestamps, cross-process restart in this agent's run |
| Graph/map/grid helpers | Stable export identities, recorded rather than invented edges, deduplicated rollups, scope/search behavior and quarter filtering, deterministic geometry | Leader comprehension, legibility of every label, accuracy of the business meaning of an entered dependency |

The tests inspect calculations and program behavior. They do not substitute for the manager's authorized browser tasks and screenshots.

## What is useful today

- A two-file import can introduce or replace an entire connected organization without temporarily creating orphaned references between separate people/project saves. Revision checks guard against one session silently overwriting another.
- Reporting chains, owner and contributor relationships use exact IDs. Renaming a leader does not require rejoining projects by name. A shared project appears once within each leader's rollup.
- Review exposes mapped columns, excluded columns, conversions and aggregate counts before confirmation. Invalid labels and unresolved references produce actionable errors instead of guessed identities. CSV and JSON-LD exports support external reconciliation.

Compared with a basic project spreadsheet, the application automatically supplies connected reporting/ownership navigation and validates those relationships. It does not prove that a spreadsheet workflow with equivalent validation and reporting could not perform the same checks.

## Trust and review limitations from current implementation

1. **The review has no before/after field diff.** `app/import-mapping.tsx:71` previews only the first five IDs and names. A valid import can change every owner, contributor, dependency, health or decision value without displaying those old/new values in the preview. The leader or source steward must inspect CSV contents and reconcile the saved result separately.
2. **Updated means matched ID, not changed values.** `lib/import-preview.ts:18` counts any imported existing ID as updated. Re-importing the unchanged two-row update files yields two Updated people and two Updated projects, even though their values did not change. This limits its usefulness for spotting actual changes.
3. **Merge replaces an entire matching record.** `lib/import-preview.ts:12` retains only omitted IDs and appends incoming complete rows. Optional missing CSV fields become defaults in `lib/csv.ts:236` onward. A simplified future export omitting `managerId`, project owner, members, priority or health can silently clear those optional values if the resulting plan is otherwise valid. The on-screen merge description and import contract disclose replacement, but there is no field-level deletion warning.
4. **Mappings are inspected, not configured.** Recognized aliases are hardcoded in `lib/csv.ts`. The review tables contain no mapping controls. An unknown optional column is excluded; a missing required column blocks parsing. A steward must rename/preprocess source columns and supported labels before import, or request a code change for additional mappings.
5. **Structural validity is not source correctness or freshness.** Known-but-wrong manager, owner and contributor IDs remain valid. Neither the person/project schema nor import review records source system, extraction time, mapping version, source owner or last verified update. Correctness beyond references must be confirmed outside the application.
6. **Only current state is retained.** `lib/db.ts` rewrites current people/projects in a transaction with one revision. This is optimistic concurrency control, not version history, audit history or rollback. Archive reconciliation exports separately before material updates.
7. **Dependency checks do not reject multi-project cycles.** `lib/domain.ts:112` rejects missing/self dependencies and duplicates; it does not detect A → B → A. Treat displayed dependencies as entered relationships, not a validated executable schedule or critical path.

## Operating effort required

Today this is a manual maintenance workflow. The application exposes local plan/graph endpoints but has no implemented Jira, Jira Align, trackIT, directory or SSO synchronization. Proposed connector assessment documents are not evidence of integrations.

A source steward must obtain both authoritative exports; preserve IDs including leading zeros/case; reconcile manager, owner, contributor and dependency keys across sources; standardize team and business-priority labels; distinguish Commitment from Delivery status and Project health; supply all required dates and four discipline demand values; and preserve every optional field they want retained on updated records. The supported roster has nine fields and the project contract has up to twenty flattened fields, including four discipline effort values. People require five columns and projects require nine; merely satisfying those minimal fields does not produce a useful leadership picture.

Each refresh requires reviewing conversions/exclusions and counts, correcting the source on validation errors, confirming the import, then checking resulting leader/project details and exporting a reconciliation snapshot. Merge leaves departed or retired records unless deliberately removed; replace requires a complete internally consistent organization. Maintaining reporting transfers, shared contributors, project dependencies, health explanations, action text, dates and realistic discipline effort requires recurring human ownership. No measured time estimate is claimed.

Several decisions remain external: whether the directory accurately reflects current accountability; whether omitted optional values should be cleared; the age and reliability of project health; commitment authorization; project-specific person allocations; actual time, costs and budget; and resolution of conflicting updates from different systems. The app's relationships and capacity results are useful only insofar as that maintained input is reliable.

## Browser checks still owned by the manager

Use the isolated saved workspace, not example mode, for persistence evidence. Confirm review/cancel leaves data unchanged; the valid merge counts and mappings match the oracle; both invalid variants prevent saves; rename/ownership and shared rollups agree in map, grid and detail; exports retain IDs and relationships; and reload retains the confirmed saved state. Screenshots and actual interaction results must determine the task's final pass/partial/fail verdict. This agent has not claimed those browser checks passed.

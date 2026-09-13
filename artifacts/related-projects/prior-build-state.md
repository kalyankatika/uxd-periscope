# Periscope build state

## Current objective — complete

Evaluate Periscope’s practical utility as a UXD leadership workspace: whether a leader can understand priorities, accountability, dependencies, delivery concerns and capacity well enough to act. Evaluation only; no redesign, feature work, migrations, dependency changes, push or deployment were performed in this run. UXD remains the focus; portfolio-manager use cases are deferred.

**Verdict: useful with targeted changes.** [Full utility review](docs/utility-review.md) includes all six evidence-backed task results, three strongest capabilities, five ranked gaps, operating effort, decisions requiring outside information, the smallest recommended improvement and a real-leader validation script. This is an agent evaluation, not real-user validation or measured time savings.

## Completed phases

| Phase | Acceptance and evidence | Status |
| --- | --- | --- |
| 1 — Expected tasks | Raw fictional records; independent ID-based reporting traversal, participant deduplication and weekday/Fraction capacity arithmetic; separate import baseline/update/error fixtures. [Expected answers](artifacts/utility-review/expected-answers.md), [import oracle](artifacts/utility-review/import-fixtures/expected-results.md) | Complete |
| 2 — Actual experience | All six tasks completed through an isolated browser/SQLite workspace; map, grid, details and exports compared where applicable. Build passed; 31 focused tests passed; 1,672 export/DOM assertions and 39 import-evidence checks passed. [Evidence index](artifacts/utility-review/README.md) | Complete |
| 3 — Utility and effort | Assessed spreadsheet advantage, manual upkeep, confidence limits and decisions requiring external data. No invented connectors or user feedback. [Review](docs/utility-review.md) | Complete |
| 4 — Verdict | Manager reviewed screenshots, artifacts, verification scripts and outputs; independent agent audited final report facts and arithmetic. Documentation links, diff whitespace and preservation checked. | Complete |

## Six task results

| Task | Result | Finding |
| --- | --- | --- |
| Top work and accountable leads | Pass | Five designated top projects and correct leads available through Overview → project comparison/detail. Preview is not the full set or a substantiated rank. |
| Intervention and reason | Pass | Five reported concerns, owners and reasons found. Decision authority, due date, freshness and closure still require outside information. |
| Leader scope without duplicates | Pass | Marcus's three reports contribute to eight distinct projects from ten memberships; Teams, comparison, map, grid and export agree. |
| Dependencies affecting priority | Partial | Graph/grid/export contain all seven dependency edges; project details truncate some direct relations. No schedule-impact model. |
| Proposed-work capacity impact | Partial | Correct +8.84 FTE-weeks and research peak 138% → 142%; overload spans seven → eight of fourteen weeks. Discipline demand does not identify person/team staffing actions; rounded red 100% is confusing. |
| Import review and persistence | Partial | Mappings/counts/rejection and exact saved merge pass; IDs, relationships and omitted records preserved across reload. Review lacks old/new field differences. |

## Ranked gaps and recommended next objective

1. No source/freshness/verification history for priority, health and relationships.
2. Incomplete dependency/shared-person information in project Related projects details.
3. No person/project bookings or leader-specific staffing constraints.
4. No decision owner/deadline/closure record.
5. Import review lacks field differences and optional-field removal warnings.

**Smallest next improvement:** repair the project detail Related projects list using existing data. It must expose all direct prerequisites/dependents, retain their direction, and compute shared people from both lead and contributor IDs. If displaying a preview, include a total and a working reveal-all control. Components → AI standards, AI research → AI standards, and the opening/retirement opposite-role shared people are acceptance fixtures. All seven dependency edges must agree across map/grid/details/export; navigation must preserve the Plan; focused regression tests, build and browser checks must pass. Full criteria are in [the review](docs/utility-review.md#smallest-next-improvement-worth-building).

This recommendation is **not implemented**. The evaluation is complete; a subsequent implementation run should establish this as its objective rather than silently extending the evaluation into feature work.

## Delegation and acceptance

- Manager: isolated environment, all six browser tasks, cross-view comparison, report, final state and preservation audit.
- utility_expected_answers: independent records/arithmetic, relationship investigation, export verification; final report audited and accepted without factual corrections.
- utility_import_checks: fictional fixtures, import/maintenance investigation, 31 focused existing tests; final file-only import verification passed 39/39 checks.

Artifacts are under [artifacts/utility-review](artifacts/utility-review/README.md). The tests verify mechanics; the Pass/Partial judgments come from manager inspection of the actual leadership tasks.

## Workspace and runtime handoff

- Evaluated main at revision 4b2c9b79ec67761dd9b7a5a24509a1d124570afd plus existing uncommitted organization-import/research/build-support work. Those local changes remain preserved.
- [Preservation result](artifacts/utility-review/preservation-after.json): all 41 tracked-by-evaluation app/test/package hashes and all three saved SQLite file hashes match the baseline. No real saved records were logged.
- Original preview at http://127.0.0.1:3000 returned HTTP 200 and remains running. The disposable source/database copy under /tmp/periscope-utility-review-20260912 was built and evaluated on port 3021. Its owned server session and dedicated browser session were closed after completion.
- Final browser error/console checks were empty. Offscreen automation clicks and a recovered blank browser tab are documented as tool limitations, not application failures. The build's initial external-symlink setup failure was resolved only in the disposable copy.

## Prior verified work and deferred scope

The UXD market/architecture/handoff assessment and organization-import work remain available. The [preceding build state](artifacts/utility-review/prior-build-state.md) preserves their detailed context and prior clean-room results. JSON ingestion, live Jira/Jira Align/trackIT/directory/SSO connectors, enterprise authorization, audit history and time/financial models remain unimplemented and outside this completed evaluation. Preserve Next.js/SQLite, saved workspace, Fidelity Sans, #368727 rounded actions and the Work map interaction design in subsequent work.

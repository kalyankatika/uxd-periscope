# Periscope utility review — UXD leadership

September 12, 2026. Agent evaluation of the current working application; no real-user validation, live enterprise data, measured time savings or product changes.

Implementation follow-up: the recommended Related projects repair has since been built. See [implementation and verification evidence](../artifacts/related-projects/README.md). The evaluation below records the pre-fix product; the remaining utility gaps still apply.

## Executive verdict

**Useful with targeted changes.** Periscope provides a useful answer to “what are we working on, who owns it, and where should I look next?” Its reporting rollups and connected navigation make a shared UXD portfolio easier to inspect than a basic flat project spreadsheet. The tested records, exports and capacity calculations agree.

It is less complete as a basis for deciding what to stop, whom to reassign, or which dependency needs intervention. Project detail panels omit some relationships that the map and export correctly contain. Capacity is discipline demand against available supply, not an allocation of named people to projects. Health and priority statements lack freshness and source evidence. Import validation protects relationships, but its review does not show the actual field changes a steward must approve.

The six tasks produced **three Pass and three Partial results**. Pass means the tested leadership question could be answered correctly through the interface; it does not establish enterprise readiness. Partial means some useful information was available, but a material part of the decision required external inspection or inference. None was untestable. The recommended next increment is a bounded repair to the project detail panel’s related-project list, followed by a real UXD leader validation session. Portfolio-manager use cases remain deferred.

## Method and evidence

The evaluated version is `main` at `4b2c9b79ec67761dd9b7a5a24509a1d124570afd` **plus the existing uncommitted working changes**, including organization import. The [preservation baseline](../artifacts/utility-review/preservation-before.json) records hashes of 41 app/test/package files and three saved SQLite files; the [final preservation result](../artifacts/utility-review/preservation-after.json) checks them again. The evaluation did not change application behavior or the user's saved workspace.

The manager ran the browser tasks and assessed utility. One delegated investigator established expected answers from raw fictional records using independent reporting traversal, participant sets and weekday/Fraction arithmetic. A second prepared import fixtures and ran focused existing tests. Neither used browser answers as the expected answer. The exact [example Plan](../artifacts/utility-review/example-plan.json), [expected answers with supporting records](../artifacts/utility-review/expected-answers.md), [machine-readable calculations](../artifacts/utility-review/expected-answers.json), and [import oracle](../artifacts/utility-review/import-fixtures/expected-results.md) are retained.

Tasks 1–5 used the fictional example: 26 people, 13 projects, seven priorities and Q4 2026. Task 6 used a separate five-person/three-project fictional baseline, then an update. A copy of the current source ran at `http://127.0.0.1:3021` with a disposable SQLite database under `/tmp/periscope-utility-review-20260912`. The user's server on port 3000 and its saved data were preserved. Browser evidence uses a 1440 × 1000 viewport.

- The isolated production build passed, including its TypeScript step: [build log](../artifacts/utility-review/build.log).
- All **31 focused existing tests passed** across import preview, combined import, API, persistence, migration and graph/map/grid helpers: [test log](../artifacts/utility-review/focused-tests.log). These establish mechanics, not leader comprehension.
- Independent [export verification](../artifacts/utility-review/export-verification.json) passed 1,672 assertions: 18 comparison-export rows, all 46 graph nodes and 90 relationships, and all 112 capacity CSV rows and corresponding browser accessibility labels across two scenarios. Assertions are not 1,672 distinct user tests.
- Browser error and console checks were empty at the start and end. [Evidence index](../artifacts/utility-review/README.md) links screenshots, action logs, downloaded files and final import checks.

This was desktop, fictional-data evaluation. Mobile, assistive-technology usability, enterprise scale, production authorization, live connectors, and real leaders' comprehension were not validated. A browser automation click initially did not scroll an offscreen target into view; explicit scrolling resolved it. One browser session unexpectedly returned to `about:blank` while the app remained reachable, and was reopened. Neither observation establishes an application defect. The isolated build initially rejected an external dependency symlink; copying the same locked dependencies into that disposable directory resolved the setup issue.

## Six-task evidence table

The expected-record column identifies the authoritative keys or calculation. The task notes below give the actual route, information gaps and interpretation.

| Leadership task | Independent expected answer and records | Actual answer and cross-view evidence | Result |
| --- | --- | --- | --- |
| 1. What matters most, and who is accountable? | Five `importance=top` records: `opening` → Maya Chen; `advisor` → Jordan Ellis; `retirement` → Leo Martinez; `experience-strategy` → Tessa Wu; `ai-standards` → Aisha Patel. Accountability follows `leadId`. | Overview showed a preview; View top priority projects opened all five with the correct owners, health and outcomes. The opening detail agreed. [Overview](../artifacts/utility-review/02-overview.png), [comparison](../artifacts/utility-review/03-top-projects.png), [detail](../artifacts/utility-review/04-opening-detail.png), [CSV](../artifacts/utility-review/top-projects.csv). | **Pass** |
| 2. Which projects need intervention, and why? | `opening` and `conversational-prototype` need decisions; `retirement`, `mobile` and `ai-research` are at risk. Five distinct projects; none blocked. Reason/action fields are transcribed in the oracle. | Needs attention returned the same five, with correct owners and recorded explanations. AI research detail showed the dataset delay and researcher-availability request. [Comparison](../artifacts/utility-review/09-attention-projects.png), [detail](../artifacts/utility-review/10-ai-research-detail.png), [CSV](../artifacts/utility-review/attention-projects.csv). | **Pass** |
| 3. What rolls up to a leader without duplicates? | `marcus` plus reports `sofia`, `ethan`, `amara`: eight distinct project IDs from ten team memberships; four top priorities, four needing attention; seven active committed and one proposed. | Teams, comparison, selected map, focused grid and exported comparison all returned the same eight projects. Team panel counted three reports, excluding Marcus himself. [Teams](../artifacts/utility-review/11-marcus-rollup.png), [map](../artifacts/utility-review/13-marcus-map.png), [grid](../artifacts/utility-review/14-marcus-focused-grid.png), [CSV](../artifacts/utility-review/marcus-projects.csv). | **Pass** |
| 4. Which dependencies could affect a priority? | Responsible AI experiences is supported by `ai-standards`, which depends on `components`. Components has three direct downstream projects and two additional downstream projects through AI standards. All seven recorded dependency edges are in the oracle. | Map/grid showed the direct dependency and its direction; export preserved all seven edges. Project detail omitted AI standards from Components' related list, and from AI research's prerequisites. Transitive impact required manual traversal. [Grid](../artifacts/utility-review/15-ai-standards-grid-connections.png), [map](../artifacts/utility-review/07b-components-map.png), [incomplete detail](../artifacts/utility-review/08-components-related-truncation.png), [graph export](../artifacts/utility-review/example-graph.jsonld). | **Partial** |
| 5. What happens to capacity with proposed work? | Include `coaching`: +8.84 FTE-weeks; research peak 138.08% → 142.26%; weeks with any overload 7 → 8 of 14. Research supply is 2.39 FTE/week. Independent weekday calculations cover every cell. | Scenario toggle, heatmap labels and both CSV exports agreed. The editor exposed the proposal's discipline effort. There was no person/team assignment answer or direct explanation of each overloaded week's project drivers. [Committed](../artifacts/utility-review/16-capacity-committed.png), [proposed](../artifacts/utility-review/17-capacity-proposed.png), [effort](../artifacts/utility-review/19-proposal-effort-expanded.png), [verification](../artifacts/utility-review/export-verification.json). | **Partial** |
| 6. Can an updated import be reviewed and trusted? | Rename person `0010`, add `0030`, update `UX-001`, add `UX-004`; retain omitted records. Expect six people/four projects, one new/one updated/zero removed in each dataset, and a single saved revision increment. Reject manager `0999` and commitment “In delivery.” | Mappings/counts and invalid-input rejection worked; review/cancel did not save. Valid import survived reload. Map, grid, detail, leader rollup, saved Plan and graph exports agreed on IDs and relationships. Review exposed no before/after field values. [Review](../artifacts/utility-review/21-import-review.png), [invalid manager](../artifacts/utility-review/22-invalid-manager.png), [invalid label](../artifacts/utility-review/23-invalid-status.png), [saved detail](../artifacts/utility-review/27-imported-project-detail.png), [verification](../artifacts/utility-review/import-verification.json). | **Partial** |

### 1 — Priorities and accountability

Route: Work map → Overview → View top priority projects → Account opening redesign → project detail. The overview previews four top projects; the full comparison exposes the fifth. The explicit link makes the complete set discoverable, but the preview is not the full portfolio.

All five names and owners matched the records. Project lead, contributors and reporting manager remain distinct. “Top priority” means a recorded classification: there is no value score or ordered ranking among the five. The overview's numbered cards can suggest an order that the data does not substantiate. No evidence supports saying one is the objectively best investment.

### 2 — Intervention and reason

Route: Overview → needs-attention project comparison → AI-assisted research synthesis detail. The overview previews three of five concerns; the comparison provides the full set and export.

The two decisions concern identity-check release scope (Maya Chen) and concept/testing scope for the conversational prototype (Ben Carter). The other concerns are delayed research recruitment (Leo Martinez), shared chart/accessibility components (Nina Patel), and a delayed de-identified dataset (Sam Okafor). AI research also requests confirmation of researcher availability. Retirement and Mobile have explanations but no explicit decision request.

This is enough to find the right conversation and understand the stated concern. It does not identify a separate decision authority, decision due date, evidence freshness or resolution history. A project end date is not a deadline for the decision. Passing this task means locating reported concerns, not proving they are current or resolved.

### 3 — Leader scope and shared work

Route: Overview → Marcus Reed → Compare projects → Work map, select Marcus → Focus connections → Grid. The eight IDs were `opening`, `advisor`, `retirement`, `insights`, `coaching`, `experience-strategy`, `conversational-prototype`, and `ai-research`.

Research repository and AI-assisted research synthesis each involve two of Marcus's reports, but neither was double-counted. Only two projects are led by his reports; the other six enter through contributors. The interface explicitly describes this rollup rule, which is useful for a cross-functional UXD organization.

“Focus connections” is a graph neighborhood: the two-step view also includes other leaders connected through the head of UXD. It is not an exclusive team filter. Marcus's sidebar/grid project set still agreed. Leader totals across the organization must not be added to obtain a portfolio total: the seven leaders have 38 project appearances across only 13 distinct projects. A shared project correctly appears once within each relevant leader's scope.

### 4 — Dependencies and priority impact

Route: Work map/Grid → Responsible AI experiences → UX AI interaction standards → Accessible component library → inspect Connections and open project details. Direct “Depends on” and “Needed by” labels made direction understandable. Components' owner is Oliver Grant; AI standards' owner is Aisha Patel. Both are reported on track, so the presence of a dependency alone is not evidence of a current delivery problem.

Components directly supports Account opening, Mobile portfolio overview and AI standards. AI standards in turn supports the conversational prototype and AI research. The graph and export contain these links. The detail dialog's four-row Related projects cap, however, can hide direct dependencies behind same-priority/shared-person rows. Browser inspection confirmed omissions for Components and AI research. Source inspection and independent enumeration found direct relationships omitted from five of thirteen project detail lists. A separate shared-person condition misses lead-to-contributor overlaps; the opening/retirement pair shares Maya and Leo in opposite roles. That additional finding is code/fixture evidence, not a separately completed browser case. See the [relationship investigation](../artifacts/utility-review/relationship-investigation.md).

Even a complete graph would not establish schedule impact: there are no dependency deliverables, lags, required-by dates or critical-path calculation. Current validation also permits multi-project dependency cycles. A leader must obtain this context elsewhere before changing a deadline or declaring a blocker.

### 5 — Capacity scenario versus staffing decision

Route: Capacity → inspect committed baseline/export → include proposed work → inspect changed heatmap/export → Planning assistant discovery → expand Effort & capacity → cancel editor. This exposed its Nov 16–Dec 31 effort: Design 0.4, Research 0.4, Content 0.2 and Design engineering 0.3 FTE. No edit was saved.

The demand total changes from 133.08 to 141.92 FTE-weeks. Research's peak changes from the week of Nov 2 to Nov 16. Research overload increases from seven to eight weeks, engineering from two to three, content remains at three, and design remains at zero. The heatmap and exports correctly represent the underlying discipline calculation.

Two interpretation limits matter. First, project contributors are not individual bookings; “allocation” is project demand by discipline. The view cannot establish whether Marcus can move a particular researcher or whether a named person is free. Second, research on Nov 30 is 2.4/2.39 = 100.4184%: correctly over capacity, but displayed as a red **100%**, while the legend places 81–100% in amber. The rounded label is confusing despite correct arithmetic. The documented model also keeps a full weekly supply baseline at quarter boundaries while prorating demand; it excludes leave and holidays. These assumptions need to accompany any staffing discussion.

### 6 — Import review, relationships and persistence

Route: People & imports → select people and projects CSVs → Review organization → inspect mappings/counts → cancel → review invalid manager file → reject → review invalid status file → reject → restore valid files → review → Import organization → reload → project Map/Grid/detail → owner rollup.

The confirmed merge renamed `0010` from Avery Shah to Avery Chen and added Taylor Brooks (`0030`). Onboarding redesign (`UX-001`) retained owner `0010`, dependency `UX-002` and existing contributors, gained Taylor, changed to On track, and recorded “Scope approved; testing is booked”. New proposed `UX-004` belongs to Taylor, includes Sam Rivera, and depends on `UX-003`. Avery's rollup contains three distinct projects and two reports. Leading-zero IDs survive throughout. The invalid inputs left the baseline unchanged; the valid import moved saved revision 1 to 2 and persisted through reload. The [file-level verification](../artifacts/utility-review/import-verification.json) checks the complete expected Plan and UI/API graph agreement.

The review is useful but incomplete for approval. It shows recognized columns, excluded columns, label conversions, ID/name previews and counts. Mapping is inspected, not interactively configured. It does not expose old/new ownership, reporting, contributor, dependency or health values. “Updated” counts matched IDs, even if values did not change. Merge replaces each matched record, so omitted optional columns can clear previous values through defaults; the contract discloses this, but the review has no field-level removal warning. Structural validation cannot detect a wrong relationship pointing to a valid person. See the [import investigation](../artifacts/utility-review/import-investigation.md).

## Three strongest capabilities

1. **A leadership question leads to the relevant work and person.** Overview classifications, named leads, explanatory updates and project details support a practical review conversation without reconstructing joins from separate lists.
2. **Reporting rollups handle shared work correctly.** Stable IDs, report traversal and project deduplication connect teams, projects and priorities; map and grid offer complementary exploration and scanning, with matching exports.
3. **Scenario calculations expose demand pressure.** Including proposed work produces independently verified weekly discipline changes, with an export that can be checked externally. It helps frame a capacity discussion, subject to the distinction between demand and named-person assignment.

## Five consequential gaps, ranked by decision impact

| Rank | Gap | Consequence for a UXD leader |
| --- | --- | --- |
| 1 | No source/freshness/verification history for reported priority, health and relationships | A correct display can still represent stale assertions. The leader cannot judge confidence or reconcile conflicting source updates inside Periscope. |
| 2 | Related-project detail lists omit recorded dependencies and some shared-person relationships | A leader can miss affected work depending on which view they use. This is a verified inconsistency, not merely missing future functionality. |
| 3 | Capacity lacks person/project bookings and leader-specific staffing constraints | Discipline overload is actionable as a question, but cannot support a safe named-person reassignment or account for skills, leave and availability. |
| 4 | Intervention has no decision owner/deadline/closure record | The workspace identifies concerns but cannot establish who must resolve them, by when, or whether action occurred. Some at-risk projects have no explicit request. |
| 5 | Import review lacks field differences and removal warnings | A structurally valid update can change meaning or clear fields without that change being visible at approval. Trust requires external comparison and reconciliation. |

## Value over a spreadsheet and operating effort

The practical advantage over a basic project spreadsheet is connected inspection: traverse reporting chains, join owners/contributors to projects, deduplicate shared work within a leader's scope, inspect a dependency, switch to a sortable comparison, and compare weekly demand scenarios. A spreadsheet can reproduce these with maintained joins, formulas, pivots and validation; Periscope packages them into navigation. For a small, flat project list, a spreadsheet may impose less setup effort. No time saving has been measured.

Population and refresh remain manual today. Jira, Jira Align, trackIT, directory and SSO synchronization are **not implemented**. Local plan/graph APIs are not evidence of connectors. A data steward must collect authoritative records, reconcile stable IDs and reporting chains, standardize team/priority labels, map supported CSV headers and status values, and supply realistic dates and discipline effort. Merely loading names and project titles will not produce useful capacity or accountability answers.

Each refresh requires reviewing changes outside the app, checking import conversions/exclusions/counts, correcting source errors, confirming the import and reconciling the result. Retained records need deliberate retirement: merge preserves omitted IDs, while replace requires a complete consistent dataset. Health reasons, decisions, membership and forecasts require continuing ownership. A regular review cadence is recommended operating practice, not an automated product capability. Comparison CSVs lack stable IDs; use the canonical import contract for reconciliation. JSON-LD is a relationship projection, not a lossless workspace backup.

Decisions still needing external information include business value and outcome evidence; current decision authority; dependency deliverables and timing; individual availability and skills; actual time, expenses and budgets; source freshness; and authorization to commit or stop work. Current-state SQLite persistence and revision conflict checks do not provide enterprise access control or audit history. Use a controlled local pilot while assessing those separate deployment needs.

## Smallest next improvement worth building

**Make the project detail panel's Related projects complete and consistent with recorded relationships.** This is smaller than introducing new provenance or staffing models, fixes a demonstrated defect using existing data, and strengthens the map-to-detail workflow the user values. It is recommended work, not implemented in this evaluation.

Acceptance criteria:

1. Every direct prerequisite and dependent remains accessible in project details, with direction explicit; same-priority/shared-person rows cannot silently displace it. If a preview is capped, show the total and a working way to reveal every related project.
2. Shared people are computed from the union of `leadId` and `memberIds` on both projects, deduplicated by authoritative person ID. A display-name change does not alter the relationship.
3. With the current fixture, Components shows AI standards as a dependent; AI research shows AI standards as a prerequisite; opening and retirement show their shared people despite opposite lead/contributor roles.
4. All seven direct dependency edges can be traced consistently across map, grid, details and graph export. Related-project navigation opens the selected project, and does not save or change the Plan.
5. Focused regression tests exercise more than four related projects and opposite participant roles. The production build passes and the browser cases above are repeated with fictional data, preserving the user's workspace and current visual design.

## Short validation script for a real UXD leader

Suggested facilitated session: about 20–25 minutes; this is a proposed script, not a recorded result. Use the fictional example and a separate disposable import workspace. Keep expected answers with the facilitator, not on the participant's screen. Ask the participant to think aloud without showing them navigation first.

1. “What work matters most, and whom would you contact?” Ask for all top projects and accountable leads; observe whether preview counts are mistaken for totals or rankings.
2. “Choose one project that needs your intervention. What is the concern, and what would you do next?” Note information the leader seeks but cannot find, including confidence in freshness.
3. “Show Marcus Reed's scope. How many distinct projects involve his team?” Ask how shared work affects totals and whether contribution is being confused with ownership.
4. “Which work could affect Responsible AI experiences? Follow the dependency and explain what you can and cannot conclude.” Observe direction, omissions and assumptions about schedule impact.
5. “Include the proposed planning assistant. What changes, and can you identify a staffing action?” Separate a correct overload reading from unsupported person-allocation inference.
6. “Review this organization update, including a renamed leader and a new project. What would you need to approve it?” Have the participant inspect an invalid fixture, cancel a review, then confirm the valid update and check it after reload.

For each task record the answer, route, assistance, misunderstood terms, confidence and unresolved question. If timing is collected, report it as measured for that participant only. Ask which current spreadsheet/report they would replace and what data-maintenance effort they would accept. Judge success by correct unaided answers **and recognition of missing evidence**, not preference for the graph's appearance. Do not infer broad UXD adoption from a single session.

# UXD Operations implementation backlog

Captured September 12, 2026 from the working-app operations review and the agreed Periscope direction. **Status: proposed implementation work, not shipped functionality.** This request captures the work; it does not start all phases. The sequence below is a recommendation, not a delivery-date commitment.

## Product outcome and users

Enable UXD Operations to maintain reliable staffing and project information, prepare leadership reviews, and follow decisions through to resolution. The Head of Design needs priorities, risks and tradeoffs; design VPs need their reporting-group scope; the VP of UXD Operations needs allocation, data quality and follow-up across groups. These are intended experiences, not implemented permission roles.

The fictional organization now includes Rowan Blake, VP of UXD Operations, reporting to the Head of Design. Adding this role did not implement an operations workflow. No operations staff or project assignments were fabricated.

## Existing foundation

Implemented: reporting hierarchy with nested reports; Work map and Grid; deduplicated project rollups; ownership and contributor relationships; project health and free-text action requests; discipline-level capacity forecasts; proposed-work toggle; manual people/project maintenance; reviewed CSV imports; exports and local SQLite persistence.

Important distinction: contributor membership is not a person's allocated time. Capacity is a forecast by discipline, not individual bookings or actual utilization. Current project updates have no per-update date or author. Historical screenshots and walkthrough results retain the fixture and labels used at the time.

## Recommended implementation sequence

### Phase 1 — Trustworthy updates and person-level staffing

| ID | Priority | Work | Completion criteria |
| --- | --- | --- | --- |
| OPS-01 | P0 | Dated project updates | Store update text, effective date, recorded time, source and updater identity when available. Display missing dates as unknown; never stamp imported old text as freshly confirmed. Configure a review cadence and identify projects awaiting updates. |
| OPS-02 | P0 | Weekly person-to-project allocation | Add allocation records keyed by person ID, project ID and week. Capture planned FTE with an explicit unit and validate references, dates and bounds. Show people with several assignments and highlight combined overload. Contributor membership alone must not create a booking. |
| OPS-03 | P0 | Availability exceptions | Capture dated leave, part-time changes and other-work commitments. Define working-day/calendar rules and prevent overlapping exceptions from double-subtracting availability. Keep planned project effort separate from non-project work and actual time. |
| OPS-04 | P0 | Staffing view and capacity reconciliation | Show allocations by person, leader/reporting group and project for a selected period. A capacity cell opens the projects and allocations causing pressure. Surface unfilled demand separately from unallocated people. Explain differences between existing discipline demand and named staffing; never add both as duplicate demand. |

**Dependencies and implementation choices:** OPS-01 can proceed independently. Agree allocation units, weekly boundaries and availability rules before OPS-02/03 calculations. OPS-04 requires both. Preserve the existing forecast while introducing named staffing; migrate without manufacturing historical assignments. Extend the import/export contract alongside each new entity.

**Phase acceptance:** an operations user can record a dated update, staff one person across two projects, record leave, and identify the resulting overloaded week and unmet project demand. Existing project and reporting IDs survive migration. Unassigned or undated legacy records remain explicitly unknown. Example edits remain temporary; isolated saved records survive reload/restart. Automated checks cover arithmetic, boundaries, broken references, migration and stale writes.

### Phase 2 — Operations overview and decision follow-up

| ID | Priority | Work | Completion criteria |
| --- | --- | --- | --- |
| OPS-05 | P1 | Operations overview | Provide actionable lists for staffing gaps, overallocated people, decisions due, blocked work and missing/stale updates. Every count opens the exact contributing records, respecting period and reporting-group filters. Explain empty and unknown states. Keep Work map as the visual drill-down. |
| OPS-06 | P1 | Structured decisions | Add decision ID, related project, accountable person, due date, status, resolution and resolved date. Separate the project owner from decision owner. Legacy action text remains a note until explicitly converted. Support open, resolved and overdue review states. |
| OPS-07 | P1 | Work intake and staffing readiness | Capture request, sponsor/requester, expected outcome, priority, requested dates, effort and required skills. Distinguish requested, reviewed, approved and staffed states from existing delivery/commitment statuses. Show approved work without staffing; avoid a second unrelated project register. |
| OPS-08 | P1 | Changes and review snapshots | Record meaningful before/after changes, source and actor when available. Produce a dated review snapshot/export with its period, filters and data freshness. Show changes since a selected review; do not treat the workspace revision number as a complete audit history. |

**Dependencies:** OPS-05 builds on Phase 1 and OPS-06; OPS-07 uses the allocation model; OPS-08 needs an append-only change model and migration. A local pilot may use explicitly identified local actors; it must not imply authenticated identity before enterprise authentication exists.

**Phase acceptance:** prepare a weekly UXD review, open an exception, assign a decision with a due date, resolve it, and compare the next review with the previous snapshot. Head/VP/Ops views reconcile to the same authoritative records. Shared projects count once within a selected scope.

### Phase 3 — Enterprise portability, source authority and access

| ID | Priority | Work | Completion criteria |
| --- | --- | --- | --- |
| ENT-01 | P1 | Reviewed JSON import | Accept a documented, versioned envelope with validation, reference checks, mapping preview and atomic commit. JSON and CSV equivalents produce identical relationships. Keep full replacement distinct from merge and field-level patch semantics. |
| ENT-02 | P1 | Connector framework and provenance | Define adapters for Jira, Jira Align, trackIT, directory/hierarchy and SSO user information. Separate source IDs from canonical IDs; define field authority and manual override rules. Provide last successful import, source-as-of date, errors, retry behavior and reconciliation. Real adapters require actual source access and agreed mappings. |
| ENT-03 | Enterprise gate | Identity and authorization | Integrate enterprise authentication and server-enforced access rules. Distinguish leadership, scoped team editing, operations administration and restricted financial data. Protect exports as well as screens. Test denied access directly at the API. |
| ENT-04 | Enterprise gate | Deployment and recovery | Preserve the local Next.js/SQLite pilot. For shared deployment, select approved persistent infrastructure, migration, backup/restore, secrets handling and operational diagnostics. Validate a clean install and upgrade without losing saved work. |

The phase ordering does not permit a shared enterprise rollout before ENT-03/04. Adapter scaffolding and fictional fixtures can be developed locally; live source collection is not assumed. A static frontend is possible with an API and durable backend; static hosting alone does not satisfy shared edits, history or confidential integrations. See the existing architecture decision rather than introducing a second architecture.

### Phase 4 — Financial, skills and scenario depth

| ID | Priority | Work | Completion criteria |
| --- | --- | --- | --- |
| OPS-09 | P2 | Budget and expense tracking | Distinguish approved budget, planned cost, actual expense and forecast. Support currency, effective rates and contractor/vendor records. Imported actuals retain their source and period; never infer actual spend from planned FTE. Restrict sensitive financial fields. |
| OPS-10 | P2 | Skills and workforce planning | Add curated skills, employment type, open positions and staffing requirements. Make unknown skills explicit; do not infer expertise or availability from AI-related job titles. Support review of onboarding/offboarding impacts without breaking historical relationships. |
| OPS-11 | P2 | Saved staffing scenarios | Compare baseline and proposed allocations, dates and capacity without changing the committed plan. Show differences and require an explicit apply action. Keep cost comparisons conditional on valid rate data. |
| OPS-12 | P2 | Outcomes and review evidence | Link expected outcomes to a named metric, baseline, target, observation period and evidence. Keep delivery progress, utilization and demonstrated user/business outcomes distinct. |

These are extensions of the previously discussed enterprise needs, not prerequisites for the first local operations release. Portfolio-manager generalization remains deferred; UXD is the current scope.

## Related UX improvements to carry forward

- Preserve the recognizable Work map and reporting layout. Keep all descendants visible in reporting focus and retain Map/Grid selection parity.
- Provide read-only project inspection from Capacity and Project plan; make Edit an explicit action. The review observed Capacity project-name links opening the editor.
- Keep concise software labels, Fidelity Sans, primary buttons #368727 and rounded actions.
- Separate people management from import administration where task-based navigation helps; preserve a clear route back to the same person/project.
- Distinguish reporting scope from organizational team labels, and leadership titles from allocation disciplines.
- Validate desktop, narrow-screen and keyboard workflows with realistic fictional data. Run a real UXD Operations participant session before claiming usability validation; AI walkthroughs are supporting evidence only.

## Delivery rules for each implementation slice

1. Record the selected slice in BUILD_STATE.md; use the Manager Loop for substantial work. Capture acceptance evidence, not just a feature checklist.
2. Preserve saved data and authoritative relationship IDs. Use additive, versioned migrations and disposable databases for write verification.
3. Update docs/enterprise-data-mapping.md and portable fixtures whenever the implemented contract changes. Proposed fields in this backlog are not accepted by today's importer.
4. Run relevant tests and production build for functional changes. Exercise the complete browser → API → persistence flow; verify example isolation and export/import parity.
5. Report shipped behavior separately from partial work, assumptions and unavailable enterprise integrations. No recurring sync jobs, external notifications or communications are started by this backlog.

## References and continuity

- [Enterprise product assessment](enterprise-product-assessment.md): earlier market analysis, product scope, time and financial extensions.
- [Architecture decision](enterprise-architecture.md): local pilot and shared enterprise deployment options.
- [Connector assessment](enterprise-connectors.md): proposed ingestion/source-authority contracts.
- [Current import contract](enterprise-data-mapping.md): implemented capabilities and validation rules.
- [Head-of-UXD walkthrough](head-uxd-research.md): recorded findings and limits from the earlier fixture.
- [Example role titles](example-role-titles.md): current design and operations leadership roster.
- [NN/g DesignOps 101](https://www.nngroup.com/articles/design-operations-101/): background on supporting design through people, processes and tools. The priorities and acceptance criteria here are Periscope recommendations based on the app review, not claims attributed to NN/g.

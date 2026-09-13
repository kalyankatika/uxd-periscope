# Head of UXD walkthrough

## Method and status

Prepared September 12, 2026. This is an **AI-assisted cognitive walkthrough and functional browser evaluation**, not human participant research. The evaluator uses a head-of-UXD perspective to examine whether Periscope supports concrete leadership questions. No interviews, participant quotes, completion times, satisfaction scores or adoption claims are inferred.

The primary agent completed the live browser evaluation on September 12, 2026. Expected answers were derived before the browser run; observations below distinguish tested behavior from supplemental steps that were not exercised. Results use Pass or Partial for the tested task coverage. Pass means the specified answer/action was available in the tested interface; it does not establish that a real leader would discover or understand it.

Use the fictional repository example in Q4 2026, starting October 1 and ending December 31. Perform saved-data mutations only on a disposable database. Preserve the user's normal database and record its before/after integrity check. Example edits should remain session-only. For each observed friction, record the concrete screen/action, leadership consequence and severity. Separate application defects from automation/tool problems.

## Dataset and independent expectations

Read the canonical records in [workspace.json](../examples/uxd-demo/workspace.json), [example source](../lib/leadership-demo.ts), [graph model](../lib/graph-model.ts) and [relationship functions](../lib/work-graph.ts). Expected reporting/project sets were derived separately by traversing raw `managerId` records and unioning projects whose `leadId` or `memberIds` belong to the resulting scope. Counts exclude the selected leader from their reports; project counts include the selected leader's own participation and are deduplicated by project ID.

**Hierarchy fixture under test:** `nina.managerId = maya`; Maya reports to Elena and Elena reports to Avery. This intentional deepening preserves all IDs, project participation, effort and dates. Verify the source and generated CSV/JSON contain this relationship before beginning; do not apply the following expectations to an older fixture where Nina reports directly to Elena. Maya's displayed title/leader treatment should reflect her management role.

| Person | ID | Direct reports | All reports | Distinct related projects |
| --- | --- | --- | --- | --- |
| Avery Morgan | `uxd-head` | 7 | 25 | 13 |
| Elena Brooks | `elena` | 2: Maya, Jordan | 3: Maya, Jordan, Nina | 9 |
| Maya Chen | `maya` | 1: Nina | 1 | 7 |
| Marcus Reed | `marcus` | 3: Sofia, Ethan, Amara | 3 | 8 |

The dataset remains 26 people, 13 projects, seven functional teams, seven priorities, seven dependency links and 25 reporting links. Its complete graph contains 46 nodes and 90 edges. Seven functional heads is a different count from all people with a management role: Avery and Maya also manage reports.

Capacity was independently checked by summing each person's `fte × (1 − nonProjectPct/100)` by discipline and prorating each project's effort by overlapping weekdays per week. Fourteen week buckets cover Q4, with a full weekly supply baseline and prorated boundary demand. Research supply is 2.39 FTE/week. All committed work totals 133.08 FTE-weeks; including the proposal totals 141.92. Research peak is 138.0753% versus 142.2594%; weeks with any overloaded discipline increase from seven to eight. These are demand forecasts by discipline, not individual bookings, holiday-adjusted availability or actual time spent.

## Eight leadership tasks

### 1. Find the reporting structure and a report's reports

**Leadership question:** “Who reports to me, and who sits below Product Design?”

Start on the platform home. Open the organization view, locate Avery, then follow Elena → Maya → Nina. Inspect both direct and all-report counts and expand/collapse controls if available. Confirm the graph lets a leader see four reporting levels without mistaking a cross-project connection for a reporting line. Locate Nina through search as an alternative route; check whether the management chain stays understandable.

**Expected answer:** Avery's seven direct reports are Elena, Marcus, Priya, Daniel, Sana, Victor and Riley. Elena has two direct reports and one indirect report. Nina reports to Maya, not Elena. Maya has one direct report. All 26 records must be accessible even if branches are initially collapsed.

**Likely risks to investigate:** People hidden by default filters; only first-level reports shown; project links visually confused with reporting edges; a leader-total label counting managers as functional teams; search showing a detached person without their chain.

**Observation / evidence / result:** **Pass after correction.** Actual clicks followed Avery → Elena → Maya → Nina. Avery showed 7 direct / 18 indirect / 13 projects; Elena 2 / 1 / 9; Maya 1 / 0 / 7. Search found Nina and exposed Maya as her manager. Initial screenshots showed grandchildren dimmed and reporting levels compressed; final rendering keeps every reporting node opaque, gives levels more vertical space, and makes nodes at least 12 screen pixels across. The focused Elena graph and Grid both contained Elena, Jordan, Maya and Nina. Expanding Indirect reports exposed Nina with “Reports to Maya Chen”. See `reporting-head-final.png`, `elena-group-final.png` and action logs.

### 2. Explain Product Design's complete work and a nested manager's scope

**Leadership question:** “What work rolls up to Elena, including Nina's work below Maya?”

Select Elena in the organization view, inspect her project list and open its comparison or map. Then select Maya and inspect her scope. Compare one shared project across these views.

**Expected answer:** Elena's nine project IDs are `opening`, `advisor`, `retirement`, `insights`, `mobile`, `statements`, `coaching`, `experience-strategy`, `innovation-lab`. Maya's seven are `opening`, `retirement`, `mobile`, `statements`, `coaching`, `experience-strategy`, `innovation-lab`. Nina contributes `mobile`, `coaching`, `innovation-lab` to the nested rollup. Elena's full set includes the completed `statements` and proposed `coaching`; any active-only display must explain that narrower scope.

**Likely risks to investigate:** Direct reports mistaken for full team; nested contributions dropped; sums of leader totals treated as portfolio totals; graph “Focus connections” mistaken for an exclusive reporting subtree. Shared work belongs to multiple leaders but only once within each leader's scope.

**Observation / evidence / result:** **Pass for nested scope.** Map inspectors and Teams & reporting showed Elena’s nine and Maya’s seven distinct projects, including Nina’s Mobile portfolio overview, Planning assistant discovery and Service concept pilots. Completed Statement content redesign and proposed Planning assistant discovery remained visible. Grid retained the selected person and reporting scope. The separate Compare projects shortcut was not exercised for this task.

### 3. Identify priorities and accountability

**Leadership question:** “What are our top priorities and who owns each?”

Open Overview, then the complete top-priority list. Open a project and locate its owner, business priority and expected outcome.

**Expected answer:** Five top projects: Account opening redesign (`opening`, Maya), Advisor workspace (`advisor`, Jordan), Retirement guidance (`retirement`, Leo), UXD product design strategy (`experience-strategy`, Tessa), UX AI interaction standards (`ai-standards`, Aisha). Ownership follows `leadId`, not the reporting manager's name. The dataset does not rank these five against one another.

**Likely risks to investigate:** Overview previews mistaken for the complete list; numbered cards read as an investment ranking; project owner confused with executive sponsor or decision approver.

**Observation / evidence / result:** **Pass.** Overview exposed four preview cards and a “View top-priority projects” action. Opening the complete list showed all five expected projects, their owner names, expected outcomes and business priorities. This verifies availability, not unaided human discovery. The fifth item requires opening the full list.

### 4. Find work requiring intervention and the stated reason

**Leadership question:** “Which issues need a conversation today, and with whom?”

Open all projects needing attention. Inspect Account opening and AI-assisted research synthesis. Locate the recorded update/action and owner without relying on an export.

**Expected answer:** Five distinct projects. `opening` and `conversational-prototype` require decisions. `retirement`, `mobile`, `ai-research` are at risk. None is blocked. Opening asks whether the identity check belongs in this release or the next; Maya owns it. AI research has a delayed de-identified dataset and asks to confirm researcher availability; Sam owns it. These records do not establish a decision deadline, separate approver or current source freshness.

**Likely risks to investigate:** Health and delivery status conflated; updates without freshness treated as real-time reporting; action requests mistaken for assigned/approved decisions. “Real time” here means an actual browser walkthrough, not live enterprise synchronization.

**Observation / evidence / result:** **Pass for intervention triage.** The Needs attention comparison showed all five expected projects, recorded action requests and owners. Account opening named Maya and the identity-check release decision; AI research named Sam and the researcher-availability request. Detailed freshness, decision deadlines and approver identity are not supplied by these records; the walkthrough did not establish them.

### 5. Trace a dependency across teams

**Leadership question:** “If the component library slips, what work needs follow-up?”

Open Accessible component library on the Work map and in project details. Inspect dependents, then follow UX AI interaction standards. Switch to Grid to confirm direction and inspect AI research prerequisites.

**Expected answer:** Components (`components`) directly supports Account opening, Mobile portfolio overview and UX AI interaction standards. Standards (`ai-standards`) in turn supports Conversational planning prototype and AI-assisted research synthesis. Components has eight related projects in its complete detail list; only three are direct dependents. AI research depends on both `insights` and `ai-standards`. Dependencies alone do not prove a schedule delay or critical path.

**Likely risks to investigate:** Related projects mistaken for dependencies; direct dependencies hidden among shared-person relationships; direction reversed; loss of selection on switching Map/Grid; multi-step impact requiring manual traversal.

**Observation / evidence / result:** **Pass for direct dependency navigation; partial for the extended protocol.** In Work map, Components listed Opening, Mobile and UX AI standards as “Needed by”. Following standards showed Components as “Depends on” and conversational planning / AI research as “Needed by”. Switching to Grid retained standards and those directions. Capacity’s project-name link opened an editor; it was cancelled before using the map. The eight-project related-detail rollup and AI research’s second prerequisite were not separately exercised in this run.

### 6. Compare capacity with proposed work

**Leadership question:** “What changes if we include Planning assistant discovery?”

Open Capacity in Q4 2026. Inspect the committed scenario, include proposed work, compare the peak and overloaded weeks, then inspect the proposal's effort. Export the capacity comparison if needed to corroborate values.

**Expected answer:** Proposal `coaching` adds 8.84 FTE-weeks. Research peak rises from approximately 138% to 142%; weeks with any discipline over capacity rise from seven to eight of fourteen. Supply remains unchanged. This view cannot identify a named researcher who is free to move.

**Likely risks to investigate:** Forecast confused with individual allocation or actual utilization; a rounded 100% label on a slightly overloaded cell; no visible explanation of which projects drive an overloaded week; fixed Q4 dates confused with current activity.

**Observation / evidence / result:** **Pass for scenario comparison.** The actual Include proposed checkbox changed Weeks above capacity from 07 of 14 to 08 of 14 while available capacity remained 15.53 FTE/week. The allocation table and proposal row were exposed. The independent numerical oracle documents Research’s peak and FTE-weeks; no capacity CSV was downloaded in this run. This remains a discipline forecast, not proof that a specific researcher is free.

### 7. Add, move and remove people safely

**Leadership question:** “Can I keep the hierarchy current without losing the work relationships?”

Use the Example for session-only interaction first. Add a clearly fictional temporary report under Maya; move that report to Marcus and remove it. Separately test moving Maya's existing subtree to Marcus, verify Nina moves with her, then restore the baseline. Attempt an invalid move of Maya beneath Nina and verify it is prevented. Review Maya's removal impact, then cancel. If a destructive confirmation is exercised, do so only on the disposable workspace and restore the fixture afterwards.

**Expected answer:** Adding one person gives 27 people and leaves all 13 projects unchanged. Removing the temporary person restores 26. Moving Maya changes only her `managerId` unless the explicit team-adoption option is chosen; Nina still reports to Maya and all ownership/contributor IDs stay intact. A move beneath a descendant must be rejected. Maya's removal review should identify one direct report (Nina), one owned project (`opening`) and three contributed projects (`retirement`, `statements`, `experience-strategy`). Cancel makes no change. Confirmed removal must retain all projects, apply the chosen report/owner reassignment and remove Maya's contributor references.

**Likely risks to investigate:** Drag handles difficult to discover/use; keyboard path missing; subtree/team move semantics unclear; silent contributor removal; cancel mutating state; Example changes unexpectedly persisted.

**Observation / evidence / result:** **Pass for core add/move/remove and cancellation.** Added Taylor Demo under Maya with manager/team prefilled, then reviewed and removed that temporary person. Moved Maya to Marcus without team adoption; Nina remained Maya’s direct report and the same seven project cards remained. Nina and Maya were absent from the valid new-manager options, preventing a descendant/self cycle. Maya’s removal review identified Nina, Account opening, and three contributor assignments; cancellation retained Maya. Reload restored the session-only example. Moving the temporary person separately, confirming Maya deletion, drag gestures and optional team adoption were not repeated in this run; existing automated tests cover the underlying operations.

### 8. Verify portable data, persistence and export

**Leadership question:** “Can my enterprise showcase reproduce the same organization and survive a restart?”

Use a disposable saved workspace. Import the repository CSV pair with reviewed mappings. Confirm the nested reporting chain and project totals, reload, and restart the disposable server. Download the graph and compare records/relationships by ID with the canonical fixture. Check the normal workspace's database integrity independently.

**Expected answer:** CSV and JSON represent the same 26 people and 13 projects. Nina's saved and exported `reportsTo` target is Maya; Maya's is Elena; Elena's is Avery. Graph export has 46 nodes, 25 reporting links and 90 total edges, with unchanged seven project dependencies. Values survive reload/restart. Generic JSON upload and live API synchronization are not implemented. The user's normal workspace remains unchanged.

**Likely risks to investigate:** Example banner mistaken for saved state; merge mistaken for field-level patch; review lacks before/after values; export of only a filtered view mistaken for the full graph; stale generated CSV/JSON diverging from the built-in example.

**Observation / evidence / result:** **Pass for repository portability.** In the disposable saved workspace, uploaded both repository CSVs, selected Replace, reviewed column/status mappings and totals, and imported 26 people / 13 projects. Every saved record matched workspace.json by ID. Reload and full server restart preserved revision 1 and all records. An actual browser download from a focused reporting view contained the full 46-node graph and 25 reporting links, including Nina → Maya → Elena → Avery. Original workspace SQLite file hashes were unchanged. JSON browser upload and live connectors remain unimplemented.

## Completion and follow-up

The browser evaluator should attach an evidence index with the exact tested revision/working state, viewport, fixture, screenshots or action logs, saved-data integrity result and any export comparisons. Confirm relevant tests and production build separately from the UX result. Fix material failures within scope and record a retest; retain a distinction between the first observation and final behavior.

A useful follow-up is a real head-of-UXD session using the same tasks with neutral prompts. Ask the participant to explain the reporting scope, dependency direction and capacity assumptions in their own words. Observe unaided task completion and misinterpretations; do not present this AI walkthrough as a substitute for that validation.

## Findings and evidence

| Severity | Observed issue | Resolution / remaining limit |
| --- | --- | --- |
| High | Selecting Elena dimmed Nina and the connecting reporting line. | Corrected in Reporting lines; final DOM check reports opacity 1 for all four nodes. |
| Medium | The full tree compressed reporting levels into a narrow band. | Increased vertical spacing based on tree width and minimum visible node size; focused groups remain compact. |
| Medium | Hiding leaders could make their reports appear to be roots. | Found in independent code review; node-type toggles are unavailable in Reporting lines. |
| Low | Full-organization view does not label every non-manager at once. | Use a focused reporting group, All labels, search or Grid. This avoids overlapping labels but requires exploration. |
| Low | Capacity project-name links open the editing form. | Observed and cancelled; Work map provides relationship inspection. A real leader session should test whether this causes hesitation. |

Evidence: [browser actions and screenshots](../artifacts/head-uxd/README.md). Desktop viewport 1440×1000; mobile 390×844 (document width 390, no horizontal overflow). Core evaluation used the initial working implementation; reporting fixes were retested on the final production build. One retest initially reused cached page resources after server restart; a fresh query-string navigation loaded the new build and verified the corrected opacity. Build setup initially failed because a copied dependency symlink escaped the isolated root; correcting the copy and clearing that isolated cache resolved it. These are evaluation-environment issues, not user-task failures.

Validation: 61 tests pass, TypeScript passes, isolated and main-preview production builds pass. No browser runtime errors were reported. No real enterprise records or human participants were used. Supplemental steps explicitly marked above were not performed and are not claimed as passes.

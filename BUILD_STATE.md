# Periscope build state

## Reporting objective — complete

Organization graph now shows direct and nested reports using the fictional four-level Avery → Elena → Maya → Nina fixture. Reporting lines uses a deterministic top-down layout and preserves all descendants when focused. Direct/indirect report lists and project totals are navigable; Grid uses the same scope. CSV/JSON fixtures and mapping documentation are updated.

## Verification and research

Completed an actual live-browser head-of-UXD cognitive walkthrough across reporting, nested projects, priorities, attention, dependencies, capacity, hierarchy changes and repository import/export. This is AI-assisted evaluation, not human participant research. [Task outcomes and limits](docs/head-uxd-research.md); [evidence](artifacts/head-uxd/README.md).

Corrected dimmed grandchildren, compressed reporting levels and misleading node-type filtering. 61 tests, TypeScript and both production builds passed. Actual CSV import matched all records by ID; reload/restart preserved the isolated saved workspace. Full graph export preserved the reporting chain. Original SQLite hashes unchanged.

Main preview runs at http://127.0.0.1:3000/ (production session 2581). Fictional edits remain session-only; saved data preserved. Source and evidence are ready for the authorized GitHub handoff.

## Roles and preserved context

Manager integrated UI/data, ran browser evaluation and verified acceptance. Independent reporting-layout worker supplied the layout/tests; research reviewer supplied an independent protocol/oracle and identified the filtering risk. [Previous completed state](artifacts/head-uxd/prior-build-state.md) retains hierarchy management, demo pack, alignment and enterprise architecture history.

Live connectors, generic JSON browser upload and real participant research are not implemented or claimed. No additional backlog or recurring work was started.

## Role-title update — September 12, 2026

Updated the fictional example’s roles and teams using clear product-design, research, conversation-design and design-engineering tracks. [Roster and public reference points](docs/example-role-titles.md). CSV/JSON regenerated; all 3 fixture checks pass. Record comparison confirmed only title/team fields changed: IDs, reporting structure, projects and capacity remain intact. The historical head-of-UXD walkthrough above documents the earlier labels.

Title update verification: production build passed; browser confirmed the new leadership labels with no runtime errors. Updated preview is running on port 3000. Saved workspace was not edited.

Leadership-level adjustment: the head is now SVP of Design, AI & Digital Products; all seven direct-report leaders are VPs of Design with their respective specializations. Manager and individual-contributor titles remain unchanged. CSV/JSON regenerated and all three fixture checks pass.

SVP/VP title adjustment verified in the running browser; production build passed.

Latest title preference: Avery is Head of Design; the seven direct-report leaders remain VPs of Design.

Latest organization update: added fictional Rowan Blake, VP of UXD Operations, as the eighth direct-report leader under Head of Design. 27 people, eight functional teams, 13 unchanged projects. The operations role has 100% non-project time and contributes no delivery capacity.

Operations VP update: 62 tests and production build passed; browser confirmed the new leader. Preview refreshed; saved workspace unchanged.

## Operations recommendations — captured

[Implementation backlog](docs/uxd-operations-backlog.md) records the operations review and related enterprise work, prioritized with dependencies and acceptance criteria. Recommended next slice: dated project updates and person-level allocation/availability, followed by the Operations overview and decision follow-up. Feature implementation has not started under this capture request. Current application behavior and saved data remain unchanged.

## Persistent application layout — complete

Left navigation stays at the viewport edge while content scrolls. The right-pane page header keeps the view title, workspace mode and actions visible. Narrow screens retain a compact left icon rail with accessible names and tooltips. Header height is measured for scroll clearance; nav changes return to the top.

Validated desktop scrolling (rail/header top=0 at scrollY=600), mobile scrolling (top=0 at scrollY=500, document width=390), visible mobile icons, page switching and modal layering. TypeScript, 62 tests and production build passed; browser reported no runtime errors. Saved data unchanged; preview running on port 3000.

## AI-native design direction — captured

Translated the user-supplied Anthropic Design lessons into [Periscope principles](docs/ai-native-design-principles.md) and four candidate experiments with dependencies and validation criteria. Linked to the Operations backlog. This is design guidance; no AI runtime, agent execution or new application feature was implemented. Existing preview and saved data unchanged.

## Header refinement — September 13, 2026

Only the example/saved-workspace status bar is sticky. Page title, subtitle, actions and planning controls scroll normally, leaving more room for Work map. Left navigation remains persistent. TypeScript and production build passed; browser confirmed header/rail top=0 while the page title scrolled out of view.

## Consistent control iconography — September 13, 2026

Replaced text-symbol icons with shared outline SVGs matching the left navigation across arrows, downloads/uploads, add/close, sorting, zoom, map controls and status indicators. Preserved accessible control labels and sort state. Desktop and mobile browser checks confirmed alignment and visibility; all 62 tests, TypeScript and production build passed. Preview is running on port 3000 with the current build. Saved workspace unchanged.

## Compact planning controls — September 13, 2026

Moved Planning period and its calendar input immediately left of Add project in the title action row. Removed the separate empty toolbar on views without scenario controls, recovering vertical space for Work map. Narrow screens wrap the controls without clipping. Production build passed; desktop/mobile browser checks passed with no runtime errors. Current preview runs on port 3000; saved workspace unchanged.

## Refreshed silent reel — September 13, 2026

Re-recorded the 40-second 1080p overview-first reel from the current app using fictional data. Shows Work map, project connections, grid, nested reporting and capacity with captions and dissolves. No audio streams; full decode and visual scene checks passed, browser reported no errors. Updated recording script for current SVG control labels and 27-person fixture. Artifact: artifacts/platform-demo/periscope-overview-demo.mp4. Saved workspace unchanged.

## Demo consistency asset — September 18, 2026

Captured docs/demo-reel-playbook.md as the reusable reference for the reel positively received by the Head of UXD. Includes reference revision/artifacts, storyboard outcomes, exact visual specifications, isolated setup, recording/retake commands, media verification and a reusable request. Linked from the repository and demo READMEs. Reviewed against the recording script, scene manifest and fixture documentation; local links checked. Documentation-only change; no new footage or app behavior changes.

## Onboarding evaluation — September 19, 2026 — complete

Scope: first-time Head of Design discovery, priority/owner and nested-report navigation, fictional CSV organization onboarding, manual hierarchy changes and reload persistence in an isolated database. Complete when browser outcomes are documented, clear defects corrected and verified, and original saved-data integrity checked. Independent read-only reviewer inspects onboarding copy/flow; primary agent owns browser evidence and integration.

Completed leadership discovery, paired CSV import, new operations hire, reviewed manager move, reload/restart persistence, grid search, capacity scenario and responsive onboarding checks. Added direct sample downloads, pre-import persistence guidance and visible capacity defaults. 62 tests/build passed; original saved data integrity verified. Report and repeatable scenario: docs/onboarding-walkthrough.md; evidence: artifacts/onboarding-review. Main preview refreshed on port 3000 (session 65962). Automation snapshot stall documented separately from product findings.

## Organization-centered workspace experiment — September 20, 2026 — complete

Branch: codex/organization-explorer. Scope: experimental Explore feature within the existing app, organization hub/spoke entry, stable-ID person/project/priority drilldowns, breadcrumb/back path, responsive map/list, scoped work/people/capacity and reviewed existing editors. Suggested actions are deterministic workspace-data cues, not claimed AI execution. Preserve the existing Work map and saved data.

Phases: model and tests (delegated); responsive explorer UI (delegated); parent integrates nav, direct entry and return-to-context tools; production build and desktop/mobile walkthrough. Acceptance: nested person → project → owner/priority drilldown, return via breadcrumb without losing context, editing updates derived content, unknown/deleted references recover, sample/saved separation, visible mobile controls, all relevant tests/build pass.

Delivered Explore on codex/organization-explorer with direct entry /?view=explore. Scoped relationship model, mobile map/list, breadcrumbs/Back, Details shortcut, existing editors, derived suggested actions and preserved return from workspace-wide tools. 70 tests and build pass; browser drilldown/edit/cancel/return/search/mobile checks passed, no errors, saved SQLite hashes unchanged. Evidence: artifacts/explorer; design/limits: docs/organization-explorer.md. Normal preview runs the experiment on port 3000 (session 98487). Main remains the previous stable build in Git.

## Simplification after user review — September 20, 2026

Removed the separate Explore feature and restored the original Work map as the sole graph entry. Removed duplicated card/spoke UI, scoped tabs and associated model; existing map interaction, inspector, focused connections, editors and planning views remain. Historical experiment evidence stays marked retired. Current branch remains codex/organization-explorer; app implementation returns to the stable main baseline. 62 tests and production build passed. Browser confirmed the previous Explore URL now opens Work map, no Explore nav remains, and project selection opens the inspector without browser errors. Preview running on port 3000 (session 46181).

## Graph workspace alternative — September 20, 2026 — complete

User requests the original knowledge graph as an alternative vantage point for all existing capabilities, without the retired card explorer complexity. Preserve default Work map. Alternative entry /?view=graph uses the original network, selection-focused connections and stable-ID breadcrumbs. Existing broad tools open with a return to the preserved map; scope must be explicit. Project/person actions reuse current editors. No new AI execution, source connectors or allocation claims.

Phases: delegate graph navigation and action entry to implementer; parent integrates alternative shell and retained map state; verify selection → connections → details/edit → whole-workspace tool → return, standard mode, mobile, tests/build. Completion requires working alternative accessible from standard navigation, current build running, and documented boundaries.

Delivered alternative /?view=graph with original network, focused selections, stable-ID breadcrumb/back/root, direct person edit/add-report and project details. Workspace tools access all existing views with explicit whole-workspace scope and preserved map/trail/camera on return. Standard Work map remains default and unchanged in behavior. Related-project drawer navigation updates graph selection without remount. Redundant graph heading removed in alternative.

64 tests and production build passed. Browser verified Head → leader → project → owner navigation, session-only person edit reflected in graph, Capacity return retaining breadcrumb/project, mobile import-tool entry/return and 390px width, related-project View in map, fullscreen Overview return without scroll lock, and standard-mode switch. No browser errors; saved SQLite hashes unchanged. Evidence: artifacts/graph-workspace; usage/boundaries: docs/graph-workspace.md. Current preview /?view=graph on port 3000 (production session 23203). Branch codex/organization-explorer; main unchanged. No agent execution/live sync or person-level actuals added.

## Consolidated Work map — September 20, 2026 — complete

User asks to apply industry assessment to the original and keep it tight. Scope: one original Work map, visible feature sidebar, stable context across map/grid and broader-tool return, person scope includes descendant team and related projects, compact Back/current scope/Whole organization (not history presented as hierarchy), direct person/project actions, and mobile controls with less overhead. Enterprise identity migrations, connectors, permissions and new allocation models remain outside this focused UI consolidation.

Phases: delegate WorkMap scope/navigation plus relationship tests; parent removes alternative shell and integrates persistent map with cross-view project navigation; verify actual scoped leader/project flows, grid parity, sidebar return, mobile and full tests/build. Saved workspace protected; fictional UI edits only. Current branch retained.

Delivered one original Work map with full sidebar; removed alternative switch, tools menu, history breadcrumb and distance controls. Person scope includes all descendants and exact period project set; project selection adds dependencies; priorities show supporting projects. Scoped totals/attention counts, linked-people label and undimmed scoped work clarify what is shown. Compact Back/context/Whole organization, direct actions and persistent map/grid/camera across whole-organization views. Cross-view View in map uses a shared project request.

Verified 67 tests, typecheck and production build. Browser: Elena9projects identical in map/grid; nested reports retained; Capacity round trip retained grid/context; global Projects→Mobile portfolio→View in map selected correct project and Back restored Elena; 390px mobile grid has9projects/no horizontal overflow; reporting group4people/0projects; final selected-scope nodes not dimmed; browser errors empty. Saved SQLite and sidecar hashes unchanged. Evidence artifacts/work-map-context; current usage docs/work-map-navigation.md. Preview running at http://127.0.0.1:3000/ (session90704), old /?view=graph also opens same Work map. Current branch codex/organization-explorer; main unchanged. No allocation model, source integration or enterprise identity migration added.

## Icon alignment — September 20, 2026 — complete

Centered Work map search magnifier and clear button in fixed icon boxes. Standardized simple icon/text action alignment, icon-only buttons, inline arrow wrappers, map inspector action arrows and miniature node icons without changing card layouts. Browser checked desktop Work map and Projects plus390px mobile: search/clear/action/navigation centers aligned (0px measured delta for sampled controls), no horizontal overflow or browser errors. Production build passes; style-only change, no redundant tests added. Current app running port3000/session93674. Saved data not edited.

## By team topology — complete

Add Network/By team layout within existing map, Network default. Keep selection/period/filter/Grid scope unchanged. Each project appears once under accountable leader from full stable-ID reporting chain; explicit unassigned group; shared priorities separate; cross-team links revealed by selection. Delegate deterministic layout/model tests; parent owns selector, groups, camera and browser validation. Acceptance: exact node parity, stable grouping, no duplicate projects with shared contributors, preserved selection, responsive controls, relevant tests/build.

Delivered Network/By team in the existing Work map. Stable-ID ownership places each project once; separate shared priorities and explicit unassigned handling. Group summaries at overview scale, zoom-to-group, cross-group links on node selection, and single-column mobile layout. Existing reporting layout, scope, inspector and Grid retained. Four model tests cover ownership, shared contributors, invalid chains and deterministic layout. 71 tests and production build passed. Browser verified selected project survives layout changes and Map/Grid round trips; 390px mobile has no document overflow and group drilldown works. Evidence: artifacts/team-layout; usage: docs/work-map-navigation.md. Network remains default; no allocation, enterprise sync or saved-data changes.

## Graph control fixes — September 20, 2026

Browse list now opens a scrollable panel over the graph instead of below the entire map. Close control and Escape dismiss it with focus restored; selecting an item closes it and opens the existing details. Layout uses a centered shared chevron instead of the native dropdown arrow. Browser verified desktop opening, keyboard dismissal/focus, mobile selection and no horizontal overflow, zero vertical center difference for the dropdown arrow, and no runtime errors. 71 tests and production build pass. Current preview running port3000 (session29796). Saved workspace not edited.

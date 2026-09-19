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

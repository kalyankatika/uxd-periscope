# Onboarding and ease-of-use walkthrough

Evaluated September 19, 2026. AI-assisted cognitive walkthrough with actual browser interactions, plus an independent source review. This is not human participant research: no satisfaction scores, unaided completion rates or participant quotes are claimed.

## Scenario

A new Head of Design wants to understand priorities and accountability. A UXD Operations partner then loads the organization and onboards a new colleague. Start with the 27-person, 13-project fictional example; perform saved changes only in an isolated database. Test period: October 2026.

## Observed results

| Task | Result and evidence |
| --- | --- |
| Understand priorities and ownership | Overview → Account opening redesign exposed Maya Chen, expected outcome, latest update and the specific identity-check decision. |
| Follow a nested report | Project owner → Maya → Nina showed Maya’s seven projects and Nina’s three. The route is connected without requiring an export. |
| Distinguish example from saved data | Global banners distinguish temporary example data from the local saved workspace. Added this explanation directly above import controls too. |
| Import a complete organization | Uploaded both repository CSVs; Replace review showed 27 new/12 removed people and 13 new/5 removed projects, recognized mappings and valid relationships. Confirmed through the browser. |
| Persist the import | Reload showed 27 people, 13 projects and five top priorities in Saved workspace. |
| Add a direct report | Added fictional Morgan Ellis, Design Operations Program Manager, from Rowan Blake’s Add direct report action. Manager and UXD Operations team were preselected. Set non-project time to 100%; saved successfully and appeared under Rowan. |
| Move a person | Opened Morgan → Move → Elena. Review explained that projects and existing team labels remain unchanged. Saved; persisted managerId is `elena`, team remains UXD Operations. |
| Reopen and find the hire | After reload and server restart, 28 people/13 projects remained. Reporting search and Grid found Morgan; API read independently confirmed the stable ID, manager and 100% non-project time. |
| Review capacity | Supply remained 15.53 FTE/week; toggling Include proposed changed research peak from 138% to 142%. The operations hire adds no delivery supply. |
| Download onboarding samples | Both new direct sample buttons produced CSV files with the expected 27 and 13 records. |
| Review responsive layout | Desktop and 390px mobile import screenshots show readable instructions and accessible sample controls. New-person availability is visible while its section is collapsed. |

## Improvements delivered

- Added People sample CSV and Projects sample CSV buttons directly to Import organization. Previously the user had to find the separate one-file panel and change its type selector twice.
- Added explicit temporary-versus-saved behavior before selecting files, rather than relying only on the global banner or review dialog.
- Exposed working-time and project-availability percentages in the collapsed Weekly availability label. The previous default of 80% project availability was easy to miss, especially for an operations hire.

## Remaining usability questions

These are recommendations for a later iteration, not implemented claims:

- Home opens a dense Work map. For an unfamiliar leader, Overview is an easier orientation point; consider an optional first-run choice or short guided checklist while preserving the map as a primary view.
- A fresh saved workspace contains a smaller starter organization. The switch from the larger example can look like data loss unless explained. A clear first-run starter/import choice would help.
- Import mapping review is thorough but lengthy. Keep the impact summary prominent and consider collapsing detailed mappings after a successful validation.
- Save-error recovery currently points users to a workspace message outside the review. Improve inline error context in a future change. No save failure was forced in this run.
- Internal operations work does not yet have its own workload model; an operations hire needs deliberate availability settings. Forecast capacity is discipline-level, not individual booking or time tracking.

## Repeatable onboarding exercise

1. Follow the [isolated demo setup](../examples/uxd-demo/README.md). Do not replace records in a real saved workspace for this exercise.
2. In Example data, open Overview. Ask: what needs a decision, who owns it, and what outcome is expected? Open Account opening redesign, then Maya and Nina.
3. Select Open workspace → People & imports. Download both sample CSVs or use `examples/uxd-demo/people.csv` and `projects.csv`.
4. Select both files and Replace people and projects. Review the record impact, mappings and references. Confirm, then reload; expect 27 people and 13 projects.
5. Open Teams & reporting → add a direct report to Rowan Blake. Enter Morgan Ellis / Design Operations Program Manager. Review Weekly availability; reserve 100% for operations for this scenario. Save and confirm Rowan’s direct report.
6. Open Morgan → Move → Elena. Leave team replacement unchecked. Review and confirm. Reload and find Morgan through Work map search/Grid; the manager should be Elena and team should remain UXD Operations.
7. Open Capacity and toggle Include proposed. Explain why demand changes but available capacity does not.
8. Ask the participant where they hesitated, what they expected to persist, and which terms they could not explain. Record their actual words separately from this AI evaluation.

## Verification and limits

62 automated tests and production build passed. Source review covered shared sample-generation behavior and accessible labels. Browser error check was empty. Original SQLite files matched their pre-run hashes before the normal preview restart; mutations were confined to the disposable onboarding database.

The automation engine stalled on an accessibility snapshot of the long import review. After restarting only the owned browser, reading visible text and confirming via a semantic button selector completed the flow. This was not established as an application defect. Browser automation also required scrolling offscreen controls into view before clicking.

No live integrations, real company data or onboarding tutorial feature were added. Removal, invalid-file rejection, concurrent saves and keyboard-only navigation were not manually retested in this pass; existing automated coverage is not a substitute for those browser scenarios.

[Evidence and screenshots](../artifacts/onboarding-review/README.md).

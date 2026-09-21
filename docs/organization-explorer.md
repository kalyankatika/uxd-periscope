# Organization-centered workspace experiment

An alternative information architecture within Periscope, on `codex/organization-explorer`. Enter through **Explore**, or open `/?view=explore`. Existing views remain available for comparison. This is a feature experiment in the same Next.js / SQLite app, not a separate deployment or database.

## Design hypothesis

Leaders can understand work more easily when navigation follows relationships: organization → leader → project → owner or priority. A breadcrumb trail expresses the path taken, while Back returns to the preceding context. A person reached through a project is not necessarily that project's reporting manager; relationship labels must make this distinction clear.

The hub is the current entity. Its spokes are navigable relationships; the detail tabs provide alternate views of the same scope. A list alternative and compact mobile layout must keep the relationships usable without requiring precise graph gestures.

## Scope and state

- Organization includes workspace people and projects overlapping the selected planning period.
- Person includes that person and all descendants, with deduplicated projects they own or contribute to.
- Project includes its owner, contributors, priority and explicit dependencies.
- Priority matches the exact stored priority label and associated projects.
- IDs, not display names, determine all person/project links.
- Existing editors review and save changes. Derived views recalculate from the current plan.
- Dedicated planning/import tools are workspace-wide; a return action preserves the exploration context within the current session.
- Example changes remain temporary. Saved-workspace changes retain the existing revision and validation contracts.

## Agentic direction

This version provides suggested next actions derived from workspace records. It does not run an AI model, execute a background agent, invent updates, synchronize enterprise systems, or make unreviewed changes. A future agent could propose changes through the same review/save boundary once its sources, permissions and validation are defined.

## Evaluation scenario

1. Open Explore in the fictional example. Find Head of Design and drill down through Elena to Maya.
2. Open a related project, then its owner or business priority. Use breadcrumbs and Back to retrace the actual navigation path.
3. Switch between the map and list; search for a known person or project. Repeat at a 390px viewport using touch-sized controls.
4. Edit an example record, save, and confirm the current context updates. Cancel another edit and confirm no change.
5. Open a workspace-wide tool and return to Explore. Confirm the context is preserved.
6. Switch example/saved mode and confirm scope is recalculated for the selected dataset.

Assess whether users can explain where they are, why records are connected, and how to go back. No human usability success rate is claimed by implementation or automated verification.

## Verified prototype

September 20, 2026: 70 tests and production build pass. Eight new model tests cover nested reports, duplicate names/distinct IDs, deduplication, boundaries, exact priority matching, deleted targets, empty organizations and live relationship changes.

Actual browser walkthrough used fictional example data: Organization → Avery → Elena (nine projects) → Maya (seven) → Account opening → Client onboarding. Back returned to the project; breadcrumb selection returned to Maya. Renaming and updating the project's health recalculated the breadcrumb, heading and attention count without losing the path. A person edit was cancelled and left Maya unchanged. Capacity opened as a full-workspace tool and Back to Explore restored the edited-project path. Mobile search found Nina and her three projects; List, Details and scoped Capacity worked at 390px with document width equal to viewport width. No browser errors were reported. Original SQLite file hashes were unchanged.

[Evidence](../artifacts/explorer/README.md) includes screenshots and interaction logs. These checks demonstrate functionality, not human usability success. Person moves/import persistence use the existing reviewed workflows; they were not repeated as saved-data mutations in this experiment. Missing-target recovery and empty data were model-tested, not exercised by deleting user data.

The breadcrumb trail is in-memory and resets on reload or switching datasets. Browser history/deep links to individual entities and an autonomous AI runtime are not implemented. The direct URL opens the organization root. Suggested actions are record-based review cues, not generated recommendations.

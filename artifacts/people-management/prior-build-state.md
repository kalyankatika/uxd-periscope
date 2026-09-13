# Periscope build state

## Current objective — complete

Packaged fictional UXD data with the repository for an enterprise showcase: matching importable people/projects CSVs and canonical workspace JSON, metadata, setup/import/demo instructions and repeatable validation. The dataset contains 26 people, seven functional teams plus the head of UXD, 13 projects, seven priorities and seven dependencies. No real enterprise or saved user records were exported.

Start with [examples/uxd-demo/README.md](examples/uxd-demo/README.md). It describes an isolated demo database, reviewed CSV import, expected counts, fixed Q4 2026 period, persistence and a five-minute showcase. JSON remains a developer reference for the current Plan format; generic JSON UI upload is not implemented.

## Completed work

| Phase | Acceptance evidence | Status |
| --- | --- | --- |
| Data pack | people.csv, projects.csv, workspace.json and manifest.json generated deterministically from leadershipDemo; complete records and exact IDs/relationships | Complete |
| Showcase instructions | Local install, isolated database, reviewed import, reload, period selection and walkthrough; linked from README, installation and mapping guides | Complete |
| Verification | Typecheck and all 45 tests passed; copied-repository production build passed; real CSV import saved 26/13 records at revision1 and survived reload/server restart; graph/API/JSON parity and saved-user-data preservation | Complete |
| Repository package | Dataset, generator, tests and documentation included alongside the current reviewed organization-import and relationship fixes, so they can travel together | Complete |

## Commands and files

- npm run demo:data — regenerates only the four fictional data/metadata files; never reads or writes SQLite.
- npm run demo:check — validates the committed pack without workspace writes.
- npm test — also includes the three new demo-data tests.
- [Data pack](examples/uxd-demo/README.md), [generator](scripts/generate-demo-data.ts), [tests](tests/demo-data.test.ts), [verification evidence](artifacts/demo-data/README.md).

The source is still the built-in fictional example. Display names are labels; reporting, ownership, contributors and dependencies use stable IDs. CSV headers/labels are readable and accepted by the current importer, with zero excluded columns. JSON uses canonical values and the existing Plan shape.

## Verification and runtime

- 45/45 tests and type checking passed in an isolated repository copy. Production build passed after retrying the stalled sandboxed native build with normal local worker permissions; no app changes were needed. Logs distinguish these steps.
- Browser review of the fresh starter showed 26 new/12 removed people and 13 new/5 removed projects, zero updated. Saved records exactly match workspace.json by ID after reload; revision advances 0→1. A complete server restart retains the exact Plan. UI/API graphs agree on 46 nodes and all relationships.
- The user's saved SQLite file hashes are unchanged. The port-3000 preview remains running. The disposable port-3023 server and browser were closed after verification.
- No new application behavior, dependency version, schema, UI design or source connector was introduced by this pack. Existing local app changes were preserved and included in the reviewed handoff scope.

## Delegation

The demo_dataset agent owned the generator, data files and tests. The manager inspected these files, wrote the README and doc links, ran integrated verification and browser import/persistence, and prepared the GitHub handoff. An independent review confirmed the guide's counts and corrected the instruction to close project dialogs before switching views.

## Preserved context and remaining scope

The [related-project repair](artifacts/related-projects/README.md) and [UXD utility review](docs/utility-review.md) remain complete. [Prior build-state handoff](artifacts/demo-data/prior-build-state.md) preserves their detail. UXD remains the focus; portfolio-manager use cases are deferred.

Remaining product gaps include source freshness/history, person/team staffing constraints, decision ownership/deadlines/closure and field-level import differences. Live enterprise connectors, authentication/authorization, audit history and time/financial models remain future work. The current dataset supports a local enterprise showcase, not a claim of live integration or production readiness.

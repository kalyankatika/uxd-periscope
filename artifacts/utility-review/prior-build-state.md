# Periscope build state

## Current objective

UXD is the active product scope, following the user's clarification. Serve ELT, the head of UXD, VP/design leaders and UXD operations with a clear view of priorities, projects, reporting relationships, allocation and related time/expenses. Portfolio-manager use cases are a future possibility and do not drive the current roadmap or completion criteria. Keep integration contracts extensible without requiring a second business domain now.

Completed foundation: market/product assessment, API/JSON/manual integration recommendations, static-versus-backend architecture decision and clean-build handoff. The documents below have been aligned to the UXD focus; the wider competitor research remains useful background.

Execution boundary: research official sources, inspect actual code, document decisions and a phased product plan, and make small reproducibility/packaging improvements. Preserve all existing local changes and saved data. No live enterprise access, connector credentials, deployment, dependency upgrade, or investment analytics implementation is authorized or implied by this assessment.

## Constraints

Preserve AGENTS.md, local Next.js/SQLite architecture, saved workspace data, session-only examples, stable relationship IDs, import contracts, and existing visual conventions.

## Phases

| Phase | Acceptance | Verification | Status |
| --- | --- | --- | --- |
| Establish evidence and scope | Preserve prior verified work; define current generic enterprise brief and source uncertainties | Repo inspection and primary-source research | Complete |
| Market and product analysis | Compare relevant competitors/substitutes, buyer jobs, differentiation, end-to-end coverage, success criteria and gaps; distinguish documented facts from recommendations | Source-linked report with 13 competitor/substitute entries, buyer jobs, coverage matrix and phased gates | Complete |
| Integration and architecture | Document generic entities, API/JSON/manual ingestion, field authority, financial/time semantics, security, static/frontend/backend/storage choices and staged delivery | Official API/framework docs, actual code audit and independent cross-review | Complete |
| Clean handoff | Reproducible local setup/checks, scoped packaging improvements, clean-room install/test/build/start, updated handoff state | Locked install, types, 36 tests, build, HTTP saves/conflicts and restart persistence; original workspace preserved | Complete |

## Evidence

- Previously delivered: leadership overview, reporting rollups, Work map and Grid, capacity, CSV mapping review, installation guide, and a 40-second silent demo. Commit `6f04d69` passed 25 tests, type checking, a clean installation/startup, and production build on the previous run.
- Manager Loop instructions integrated by fast-forward from `6f04d69` to `4b2c9b7` on 2026-09-12. The working tree was clean before integration; no documentation conflicts occurred. Existing AGENTS.md requirements and Next.js guidance remain intact.
- Previously resolved gap: replacing a people roster could fail against old projects before their matching replacement project file was loaded. Combined validation and one plan save removes this invalid intermediate state.
- Saved database files were fingerprinted locally before work. No workspace records are included in this state file.
- Implementer `combined_import_model` delivered `previewWorkspaceImport` and 10 focused tests. Manager reviewed the diff and tests: final-state validation, per-dataset counts, UTF-8 save-size checks, exact IDs, reporting cycles, taxonomy, and date retention are covered. Existing dependency semantics remain unchanged.
- Manager added the combined review UI, shared single-file mapping presentation, and an isolated API test verifying one revision increment, graph/leader identity, stale-save rejection, and no partial write on invalid replacement. The API test passed.
- Integrated verification: all 36 tests, type checking, and the production build passed. Browser checks passed for valid replacement, cancellation, missing manager/unsupported-label errors, reload persistence, example-mode isolation, imported leader/map/grid relationships, single-file regression, and desktop/mobile layouts. The review uses the existing plan API; no persistence or schema change was needed.
- The three original saved SQLite files matched their pre-run fingerprints after all write verification. Browser writes used a disposable database on port 3011.
- Detailed results and fictional-data screenshots: [organization import verification](artifacts/organization-import/README.md). Import, installation, README, and leadership documentation now describe the combined workflow.
- Enterprise assessment delivered on 2026-09-12: [product and market](docs/enterprise-product-assessment.md), [architecture](docs/enterprise-architecture.md), [connector contracts](docs/enterprise-connectors.md), [build audit](docs/enterprise-build-audit.md), and [handoff](docs/enterprise-handoff.md). Primary vendor/standards sources establish documented capabilities, not hands-on competitive validation or tenant access.
- Delegated connector research and repository/build audit returned bounded deliverables. Manager inspected the code evidence, logs and documents; both workers independently reviewed the final product/architecture recommendations and found no material contradiction or implementation overclaim.
- Added `npm run verify`, tested Node pin `.nvmrc` (22.23.2), and a SHA-pinned read-only GitHub verification workflow. No dependency or lockfile update. Remote workflow execution is pending; no push or deployment occurred in this assessment.
- Clean-room verification passed on macOS arm64: `npm ci`, type checking, 36 tests, production build, home/plan/graph HTTP checks, validated save, stale revision 409, foreign-origin 403 and restart persistence. Production dependency audit reported zero known vulnerabilities on the check date. Evidence: [enterprise handoff verification](artifacts/enterprise-handoff/README.md).
- The independent source audit confirmed all 39 application/library/test files match the verified snapshot, along with package metadata, lockfile, runtime pin and workflow. New report links, Markdown fences, footnotes and evidence JSON were checked; `git diff --check` passed. No browser re-run was needed for documentation/build-metadata-only changes; prior UI evidence remains applicable.

## Next action

The assessment and UXD scope clarification are complete. The next proposed implementation phase is the UXD data foundation plus reviewed JSON ingestion: stable team/priority IDs, UXD discipline/work-type mappings, schema versions, source provenance and safe migrations while preserving the CSV workflow and saved SQLite workspace. Completion should prove that UXD priorities, leader/report relationships, projects and allocation stay consistent across Overview, Work map and Grid. A second business-domain preset is deferred. The proposal has not been implemented in this research run. A later shared-service phase must establish authentication and record/field authorization before sensitive multi-user use.

## Blockers and deferred work

No blocker remains to the completed analysis or local build verification. trackIT and whoswho are unspecified potentially internal products; their schemas, endpoints, auth, ownership, and usage rights require enterprise input. Live Jira/Jira Align access and SSO/directory integration require deployment/version and permission details. Shared deployment, actual costs/expenses, connector automation, and domain-generic data migrations remain proposed until implemented and verified.

Enterprise distribution also needs an owner-confirmed right to use/redistribute the bundled Fidelity fonts and an explicit repository licensing decision. Embedded font notices are permission-restricted; this audit does not determine whether the user already has permission. Existing fonts and design requirements were preserved. The branch remains `main` at `4b2c9b7` with preserved prior changes and this assessment's additions in the working tree; these changes must be transferred before an enterprise imports them from a remote clone.

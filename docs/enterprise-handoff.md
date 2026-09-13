# Enterprise handoff

## What this repository contains

Periscope is a working local portfolio workspace with a UXD example, executive overview, reporting drill-down, Work map/Grid, project comparison, capacity planning, manual edits and reviewed people/project CSV imports. The current app uses Next.js and an embedded SQLite database. It does not need an external database server or API credentials to run locally.

**Active product scope: UXD.** ELT, the head of UXD, VP/design leaders and UXD operations are the current users. Portfolio-manager use cases are a future possibility. Preserve extensible integration contracts without making a second business domain a release requirement.

The enterprise assessment is complete as a research and design package. It does **not** make the app an authenticated enterprise service or implement live connectors, expenses, actual time, generic JSON uploads or a generic domain migration.

| Document | Purpose |
| --- | --- |
| [Product and market assessment](enterprise-product-assessment.md) | Competitors/substitutes, users, end-to-end coverage, positioning, metrics, roadmap and pilot gates |
| [Architecture decision](enterprise-architecture.md) | Static frontend versus server/database choices, generic model and migration sequence |
| [Connectors and proposed JSON contract](enterprise-connectors.md) | Jira/Align/directory facts, mapping authority, automation, manual overrides and unresolved source contracts |
| [Build and portability audit](enterprise-build-audit.md) | Actual implementation, gaps, distribution issues and clean-build findings |
| [Installation](installation.md) | Local installation, configuration, backups and startup |
| [Implemented import contract](enterprise-data-mapping.md) | Current CSV behavior and supported relationship/status mappings |
| [Verification evidence](../artifacts/enterprise-handoff/README.md) | Isolated install, 36 tests, production build, HTTP and persistence results |

## Reproduce the local build

Use Node.js **22.23.2**, recorded in `.nvmrc`. The declared minimum remains 22.13.0; newer supported versions require their own validation. With an existing Node installation:

```sh
npm ci
npm run verify
npm start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). `verify` runs type checking, tests and the production build. If using nvm, run `nvm install` and `nvm use` first; nvm itself is optional. See the installation guide for cloning and database backups.

The new GitHub workflow runs the same locked install and verification on pushes and pull requests, with a disposable database, read-only repository permissions and pinned action revisions. Its YAML was checked locally; **the remote Linux workflow has not run** in this assessment. Local clean-room evidence is from macOS and should not be described as a completed Linux/Windows certification.

## Verified baseline

An isolated copy excluding the user's database, environment files and dependency/build directories passed locked dependency installation, type checking, all **36 tests**, production build, homepage/API checks, validated saves, stale-revision rejection, origin rejection and restart persistence. The temporary audit server was stopped. Production dependency audit reported no known vulnerabilities on 2026-09-12; this is a time-bound package advisory result, not a security certification.

Existing local changes and the running local preview were preserved. The repository changes from this assessment and the preceding organization-import work are not automatically present in an older GitHub clone. Before importing from a remote repository, commit and transfer the reviewed working tree through the enterprise's chosen process. This assessment does not push or deploy it.

## Enterprise release gates

1. **Distribution rights:** confirm rights for the bundled Fidelity Sans assets and intended repository licensing. Embedded font notices are permission-restricted; no redistribution grant is recorded here. No root license file is currently supplied. An owner must make these decisions; a generated license would not establish rights.
2. **Identity and access:** add enterprise authentication and server-side record/field authorization before shared sensitive-data use. The current origin check and revision check are not user authentication or project access controls.
3. **Data ownership:** provide approved source specifications, versions, scopes, immutable identity crosswalks, field authority and anonymized validation fixtures. trackIT and whoswho have no verified API contract yet.
4. **Persistence and operations:** select approved hosting/storage, secret management, migration ownership, backup/restore, retention and support. Static hosting still needs backend services for shared state and synchronization.
5. **Product semantics:** approve work hierarchy, domain configuration, calendars, allocation definitions, financial units/currencies and historical reporting rules before publishing derived enterprise totals.

Source exports, saved SQLite files, credentials and real company records must remain outside source control. Default database and environment paths are already ignored. A custom `DATABASE_PATH` requires equivalent storage and exclusion handling. Use fictional fixtures in tests and demos.

## Next implementation

The next bounded phase is **UXD data foundations plus reviewed JSON ingestion**: stable IDs for teams and priorities; agreed UXD discipline/work-type mappings; a versioned schema; source provenance; migration of current saved work; and preview/validation/commit using the same principles as CSV import. Verify that priorities, leader/report relationships, projects and allocation remain consistent across Overview, Work map and Grid. Keep the existing UI conventions and local SQLite pilot intact. Additional business-domain presets are deferred.

After that, implement one approved read-only source and a directory mapping behind enterprise access controls. Add time and finance only after their authoritative definitions and reconciliation fixtures are supplied. [BUILD_STATE.md](../BUILD_STATE.md) records the current completed objective and these boundaries.

# Enterprise build audit

Reviewed on 2026-09-12 against revision `4b2c9b79ec67761dd9b7a5a24509a1d124570afd` plus the working tree's combined organization import. This is a code and local build audit, not a penetration test, enterprise certification, or production deployment approval. The source snapshot and command evidence are recorded in [enterprise handoff evidence](../artifacts/enterprise-handoff/README.md).

Subsequent scope clarification: UXD is the active product focus. The generic-model observations below remain architectural findings; a second business-domain preset and portfolio-manager use cases are deferred. Follow the UXD next phase in [enterprise handoff](enterprise-handoff.md).

## Finding

Periscope is a working local leadership planning application with a useful relationship model and a portable installation. It can support a controlled evaluation using approved data. It is not yet a shared enterprise integration platform. The next product phase should preserve the interface and local deployment while introducing a generic, versioned data contract and explicit source ownership. Authentication, authorization, connector operations, and financial controls are required before the corresponding enterprise capabilities can be offered.

The current source is a dynamic Next.js application with a Node.js runtime and an embedded SQLite database. A static user interface backed by enterprise APIs is a viable later deployment shape, but this repository does not currently implement that separation. A static hosting switch alone would not preserve saved edits or its API behavior.

## What the code implements

| Area | Status | Evidence and limits |
| --- | --- | --- |
| Leadership overview | Implemented | [app/leadership.tsx](../app/leadership.tsx) renders priorities, project health, team reporting, and projects related to a leader's reporting chain. Health and delivery are explicitly reported values. |
| Work map and comparison | Implemented | [app/work-map.tsx](../app/work-map.tsx), [app/work-grid.tsx](../app/work-grid.tsx), and [lib/graph-model.ts](../lib/graph-model.ts) expose people, leaders, projects, priorities, filters, focus, and connected details. The graph is computed from records; there is no graph database dependency. |
| Manual entry | Implemented for people and projects | [app/planner.tsx](../app/planner.tsx) and [app/leadership.tsx](../app/leadership.tsx) create and edit people/projects, reporting lines, ownership, contributors, status, and planning effort. This is not manual expense entry or a timesheet. |
| CSV ingestion | Implemented | [lib/csv.ts](../lib/csv.ts), [lib/import-preview.ts](../lib/import-preview.ts), and [app/workspace-import.tsx](../app/workspace-import.tsx) inspect mappings, report conversions, validate combined people/project data, and merge or replace after confirmation. Unknown labels and broken relationship references are rejected. |
| Atomic import and saves | Implemented locally | [lib/db.ts](../lib/db.ts) uses transactions and a whole-workspace revision check. A stale save receives a conflict instead of replacing a newer plan. Every successful save replaces the people/project tables and increments one revision. This is not a durable edit history. |
| Example isolation | Implemented | [app/planner.tsx](../app/planner.tsx) maintains separate example state in memory. A fresh saved database receives the smaller starter seed in [lib/seed.ts](../lib/seed.ts). The larger leadership example is not silently written to that database. |
| Capacity | Implemented as planning estimates | [lib/capacity.ts](../lib/capacity.ts) and [lib/allocate.ts](../lib/allocate.ts) calculate weekly capacity and project demand by discipline, including weekday proration. They do not ingest actual time worked, individual bookings, holidays, costs, or approved timesheets. Contributor membership does not allocate a person's time to that project. |
| Internal JSON API | Implemented, local scope | `GET /api/plan`, `PUT /api/plan`, and `GET /api/graph` exist. JSON writes must be the current internal `Plan` with revision, supported fields, and complete valid relationships. This is not a general JSON import facility or an enterprise connector API. |
| Graph JSON-LD export | Implemented | [lib/work-graph.ts](../lib/work-graph.ts) exports typed nodes and explicit relationships. It is a derived exchange view, not a complete database backup or a supported round-trip import format. |
| Enterprise sources | Not implemented | No Jira, Jira Align, trackIT, directory, SSO, webhook receiver, polling worker, source credential store, or synchronization state exists in the audited application. |
| Financial tracking | Not implemented | No currency, budget, expense, actual cost, commitment ledger, rate card, cost center, accounting period, or financial permission model exists. Effort is FTE demand, not money. |
| Shared enterprise controls | Not implemented | No sign-in, user/session model, per-workspace or per-record authorization, audit log, tenant boundary, source lineage, approval workflow, or retention policy is implemented. |
| General business domains | Partial foundation | People, projects, ownership, reporting, delivery, and relationships are reusable concepts. The discipline and effort schema remains UXD-specific; a generic product description does not change this contract. |

## Portability and persistence

[package.json](../package.json) requires Node.js 22.13 or later because the database uses built-in `node:sqlite`. The tested runtime is pinned in [.nvmrc](../.nvmrc) to **22.23.2**. SQLite needs a writable, durable local file location, but it needs no separate database service. The default start command binds to `127.0.0.1`; it does not publish a shared service.

The locked versions include Next.js 16.3.4, React/React DOM 19.3.0, D3 Force 3.0.0, Papa Parse 5.7.0, Zod 4.6.1, TypeScript 5.9.3, and tsx 4.23.13. This audit did not update dependencies. Application fonts are local, so the production build does not need a runtime request to Fidelity's font host. A first dependency installation still requires a registry or an enterprise mirror/cache.

SQLite initializes schema and starter data lazily. Its WAL mode, busy timeout, SQL parameters, validation, transactions, and revision check are useful local safeguards. Relationships are primarily validated by the application, not normalized foreign keys: details and effort are stored as JSON text. Current migrations check for the `details` column rather than a versioned migration ledger. Backup/restore is documented in [installation](installation.md); recoverability must be tested against the eventual enterprise deployment topology.

For a single controlled local evaluation, keep this architecture. For a shared service, first define concurrency, recovery objectives, access boundaries, and hosting constraints. A durable single-instance SQLite deployment can be an explicit interim choice; the audited design does not establish reliable multi-instance operation. Moving to Postgres or an existing approved enterprise database later is an architectural option, not an installed capability. A graph database is not required merely to draw the Work map.

## Static UI versus backend

[app/page.tsx](../app/page.tsx) calls `readPlan()` on the server and declares `force-dynamic` with the Node runtime. Both API route files also declare a dynamic Node runtime. The installed Next.js guides describe static exports as files served without a running application server and describe client-side fetches as a way to consume a separate API. They do not provide a way for this application's SQLite writes to run on a static host. See the corresponding official [static export guide](https://nextjs.org/docs/app/guides/static-exports) and [self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

A future static frontend can work if a backend provides authenticated reads/writes, controlled enterprise API access, validation, synchronization jobs, manual records, audit history, and durable state. That backend may be Periscope's Node service or approved enterprise services. A browser-only read-through dashboard would still depend on source APIs and their permissions; it cannot safely hold service credentials or independently retain shared manual entries and synchronization history. Do not export real workspace data into public static build artifacts.

## Generic data model gaps

1. **Disciplines are fixed.** [lib/domain.ts](../lib/domain.ts) hard-codes `design`, `research`, `content`, and `design_eng`; each project's effort has those four keys. CSV requirements and capacity calculations use the same list. Introduce configurable discipline IDs and a UXD preset through a backwards-compatible migration before claiming support for arbitrary functions. Preserve unknown-source rejection; configuration should not become silent coercion.
2. **People and projects have stable IDs; other concepts do not.** A person's `team` and a project's `priority` are strings. Priority graph IDs are generated from the label, so a rename changes that identity. Introduce stable organization, team, portfolio, priority, and source-reference IDs before enterprise reconciliation. Cross-source identity needs an agreed mapping table; matching display names is insufficient.
3. **Source provenance is absent.** Records have no source instance, external ID, observed timestamp, imported timestamp, mapping version, sync run, field ownership, or tombstone. Whole-record CSV merge currently replaces matching IDs, including defaulted optional fields. Automatic updates must not silently overwrite manual annotations or approved overrides.
4. **Time and money need separate facts.** Introduce planned allocation, actual time, budget, commitments, and expenses as separate entities with units, dates, source keys, and correction semantics. Add currency and effective rate treatment before any cost rollup. Avoid equating headcount, FTE, actual hours, and spend.
5. **Portfolio and decision history are absent.** There is no durable portfolio/program hierarchy, target/actual outcome series, baseline, funding decision history, or approval workflow. A project has one free-text priority and current status fields. Define these separately from Jira issue types and Jira Align hierarchy names.
6. **Integration contracts are not versioned.** The local `Plan` schema has a revision for optimistic concurrency, not a schema version. Add a documented JSON envelope and explicit adapters before accepting arbitrary vendor payloads. Include test fixtures for pagination, partial failures, replay, deletion, rename, and ID collisions.

## Trust and scale boundaries

The saved workspace is loaded server-side and returned to the client. Both GET APIs are unauthenticated. The PUT route checks the browser origin against its host, validates the plan, and checks its revision. An origin check is not identity or authorization. It is a local cross-origin protection, not an enterprise API access policy.

The PUT route currently checks `Content-Length` and then `text.length` after buffering the request; import previews count UTF-8 bytes. Enterprise ingress should use one consistent byte-based limit enforced while reading and at the gateway. Validate trusted proxy handling before deploying behind enterprise routing. Access checks must cover pages, reads, writes, and graph exports together.

The schema permits up to 10,000 people and 10,000 projects, but those maxima are validation ceilings, not a performance claim. The map computes a D3 layout with 220 simulation ticks and displays a derived graph in the browser. Current tests use small fixtures. Benchmark expected organization sizes and add server filtering, aggregation, pagination, and graph detail limits as needed before committing to enterprise scale.

The repository includes positive protections: typed validation, exact person/project references, reporting-cycle checks, parameterized SQL, atomic saves, optimistic conflict handling, CSV formula escaping, and tests around those behaviors. Project dependencies prevent self-links and missing references; they do not currently reject every multi-project cycle. Decide whether cross-project cycles are valid business relationships before changing that rule.

## Build handoff delivered in this run

- `npm run verify` runs type checking, all tests, then a production build and stops on failure.
- `.nvmrc` records the tested Node.js runtime without broadening or upgrading package dependencies.
- [.github/workflows/verify.yml](../.github/workflows/verify.yml) defines the same locked install and verification on push and pull request. It has read-only repository contents permission, no deployment step or application secrets, no persisted checkout credentials, a timeout, and cancellation of superseded runs. It is a workflow definition; remote execution has not been demonstrated in this run.

The workflow pins [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) and [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0) to their full release commit SHAs, verified from their official release pages on the audit date. Those actions use a Node 24 action runtime; setup-node separately installs the application's `.nvmrc` runtime. An enterprise GitHub installation must allow the pinned actions and a compatible runner, or mirror them under its own policy.

## Required enterprise gates and later work

| Gate | Before what use | Owner/acceptance evidence |
| --- | --- | --- |
| Approved source scope and mapping | Importing real enterprise records | Named source owners approve fields, stable IDs, taxonomy, relationships, allowed users, and retention. Redacted fixtures pass the contract. |
| Identity and authorization | Shared access | Enterprise sign-in plus server-enforced workspace/record permissions; restricted people/cost data and exports tested for unauthorized access. SSO claims alone do not establish reporting hierarchy. |
| Durable operations | Shared service | Agreed storage, migration and restore rehearsal, monitoring, owner/on-call process, and tested recovery objectives. |
| Integration controls | Automatic ingestion | Service credentials stay server-side; source ownership, mapping versioning, cursors, idempotency, retries, rate limits, quarantine, and deletion handling have operational tests. |
| Finance semantics and access | Expense or cost reporting | Finance owner signs off units, currency, rates, source precedence, reconciliation, restatements, and permissions. |
| Software and asset review | Enterprise redistribution | Approved dependency/asset inventory and repository usage terms. Recorded vulnerability checks do not establish a complete software supply-chain review. |
| Scale and accessibility | Enterprise rollout | Representative load and graph-size measurements, keyboard/screen-reader review, and user acceptance from executives and data stewards. |

Later implementation can add a static frontend package, enterprise database adapter, advanced scenarios, and additional connectors when requirements justify them. None is required to reproduce today's local build. No credentials, saved workspace database, background synchronization, or external deployment was added by this audit.

## Asset metadata

No root project `LICENSE` file or font permission record was present in the audited snapshot. All three bundled Fidelity Sans WOFF files contain name-table copyright metadata naming FMR LLC and a license-description field requiring express written consent for reproduction, copying, adaptation, modification, or dissemination. This is recorded file metadata, not a conclusion about the user's existing authorization. Preserve the requested fonts; the enterprise owner should confirm that the intended use and distribution are covered and supply the relevant record. The lockfile's open-source dependency license fields do not establish permission for these separate font assets.

## Verification scope

The evidence directory records the clean-room commands, results, source fingerprints, and limitations. Verification uses a temporary source copy without the user's database, local environment, existing dependencies, or build output. A passing clean build confirms reproducibility on the tested machine. It does not by itself validate Linux CI, shared deployment, real source synchronization, or regulated financial reporting.

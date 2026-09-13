# Enterprise handoff verification

Date: **2026-09-12**. Source revision: `4b2c9b79ec67761dd9b7a5a24509a1d124570afd` on `main`, with the existing uncommitted combined organization import. The evidence covers that application snapshot plus the verification script/runtime/workflow metadata added during this audit. It is not evidence that the working tree has been committed, pushed, or deployed.

## Isolation

Source files were copied to `/tmp/periscope-enterprise-audit-20260912`, excluding `.git`, `.next`, `node_modules`, `data`, `artifacts`, local environment files, agent configuration, and TypeScript build caches. `.env.example` was included. The copy installed its own locked dependencies and built from source. No saved workspace records were copied, read, or changed. All write checks used a disposable fictional database.

[verification-manifest.json](verification-manifest.json) records the initial dirty file list, tested runtime, exclusion rules, and SHA-256 hashes of copied inputs. No dependency version or lockfile was changed. Documentation written concurrently by the manager is outside the application verification snapshot.

## Results

| Check | Command / action | Result |
| --- | --- | --- |
| Runtime | `node --version`; `npm --version` | Node 22.23.2; npm 10.9.8; Darwin arm64 |
| Clean install | `npm ci --cache /tmp/periscope-enterprise-npm-cache --no-audit --no-fund` | Passed; 62 packages installed from the lockfile |
| Individual type check | `npm run typecheck` | Passed; [log](audit-typecheck.log) |
| Individual tests | `npm test` | 36 passed, 0 failed; [log](audit-test.log) |
| Final combined verification | `NEXT_TELEMETRY_DISABLED=1 DATABASE_PATH=/tmp/periscope-enterprise-audit-20260912/verification-data/planner.sqlite npm run verify` | Type check, 36 tests, and Next.js production build passed; [log](audit-verify.log) |
| Dependency advisory query | `npm audit --omit=dev --json --cache /tmp/periscope-enterprise-npm-cache` | Exit 0; 0 known vulnerabilities reported for production dependencies; [response](audit-dependencies.json) |
| Workflow syntax | `node node_modules/prettier/bin/prettier.cjs .github/workflows/verify.yml --check` | YAML parsed and formatting passed |
| Production startup | `DATABASE_PATH=/tmp/periscope-enterprise-audit-20260912/smoke-data/planner.sqlite NEXT_TELEMETRY_DISABLED=1 npm start -- --port 60961` | Started and restarted successfully; [log](audit-start.log) |
| Actual HTTP behavior | Requests against the disposable production server | Home, seed, valid save, stale revision rejection, foreign-origin rejection, graph identity, and restart persistence passed; [results](audit-smoke.json) |

The HTTP checks verified a fresh saved seed of 12 people and five projects, one fictional project addition at revision 1, HTTP 409 on a stale save, HTTP 403 on a foreign-origin write, the project's stable JSON-LD identity, and six projects after a restart. The audit server was stopped after verification. The user's existing server was left running.

The first install attempt was blocked by sandbox DNS restrictions and the first sandboxed Turbopack build did not progress. Only the identified audit processes were stopped. Network-enabled installation and normal local build permissions succeeded. No automatic approval review rejected an action.

## Delivered build support

- `npm run verify` provides one fail-fast local check.
- `.nvmrc` pins the tested Node version.
- `.github/workflows/verify.yml` defines locked installation and verification on push and pull request, with SHA-pinned actions, read-only contents permission, no application secrets, and no deployment.

The workflow has not run remotely. This run validates macOS arm64, not Linux or a GitHub Enterprise runner. Npm advisory output is a dated dependency check, not a penetration test or supply-chain certification. Browser interaction was not repeated for these build-metadata changes; earlier combined-import browser evidence remains in [organization import verification](../organization-import/README.md).

The [enterprise build audit](../../docs/enterprise-build-audit.md) distinguishes implemented product behavior from integration, financial, security, and deployment work that remains.

# Organization import verification

Verified locally on 2026-09-12 after integrating `origin/codex/periscope-manager-loop` at `4b2c9b7` into `main`.

## Scope

**People & imports → Import organization** accepts a people CSV and a project CSV, reviews their mappings and combined relationships, then saves both datasets in one revision-checked transaction. Merge preserves omitted IDs; replace removes omitted records in both datasets. All project dates are retained. The existing one-file import remains available.

The browser walkthrough used a separate server on port 3011 and a disposable SQLite database. All screenshots show fictional data. The user's three saved SQLite files matched their pre-run fingerprints after verification.

## Results

- `npm test`: all 36 tests passed, including 10 new combined-preview tests and an isolated API integration test.
- `npm run typecheck`: passed.
- `npm run build`: passed with Next.js 16.3.4.
- Combined preview is read-only. Cancelling either organization or one-file review left the saved database unchanged.
- Missing manager references disabled confirmation. An unsupported discipline label produced a file-specific error before review.
- Replacing the disposable starter imported 26 people and 13 projects with one revision increment. Reload retained the saved organization.
- The API integration test confirmed that stale revisions return 409 and invalid replacements return 400 without partially changing either dataset.
- Imported leader/project identities appeared in the Work map, Grid, and Riley Thompson's team view, including UX AI interaction standards and the two direct reports.
- Renaming a person through an example-mode combined import changed the displayed map label only for that session. The saved database did not change; reload restored the saved label.
- The import form and review dialog were inspected at 1440 × 1000 and 390 × 844. The narrow-screen document and dialog widths matched the viewport; the counts table scrolls horizontally within its container. Keyboard navigation and cancellation worked.
- No browser runtime errors were reported. The retained single-file review still displayed column and label mappings.

## Screenshots

- [Import form](import-form.png)
- [Organization review and counts](organization-review.png)
- [Mobile review](review-mobile.png)
- [Imported leader's projects](imported-leader.png)

## Limits

No authoritative enterprise source has been supplied. This verifies manual CSV ingestion and reconciliation, not a live connector or synchronization. Shared authentication and deployment are outside this phase. See [the import contract](../../docs/enterprise-data-mapping.md) for supported fields, labels, and size limits.

# Utility review evidence

Agent evaluation, September 12, 2026. All recorded people/projects are fictional. Start with the [utility review](../../docs/utility-review.md); [BUILD_STATE](../../BUILD_STATE.md) records completion and the next recommendation. No product features were changed in this run.

## Expected answers and verification

- [Raw example Plan](example-plan.json), [independent expected answers](expected-answers.md), [full calculation output](expected-answers.json).
- [Import fixtures and expected results](import-fixtures/expected-results.md), [import investigation](import-investigation.md), [fixture check log](import-fixtures/check-results.log).
- [Export verification](export-verification.json): 1,672 assertions passed, comparing 18 project comparison rows, all 46 graph nodes/90 relationships, and 112 weekly discipline rows plus 112 DOM labels. Run `python3 artifacts/utility-review/export-verification.py` from the repository root to repeat file-only verification.
- [Import verification](import-verification.json): 39 checks passed against independently interpreted fixture CSVs. Captured saved Plan is exact; the UI/API graphs agree. Run `python3 artifacts/utility-review/import-verification.py` to repeat file-only verification.
- [31 focused existing tests](focused-tests.log), [successful production build](build.log), [runtime status](runtime-final.json).
- [Before preservation hashes](preservation-before.json) and [after preservation hashes](preservation-after.json): all 41 app/test/package files and three saved SQLite files unchanged. The [preceding build state](prior-build-state.md) preserves the earlier work context.

The Python verification scripts compare captured artifacts; they do not rerun browser interaction, prove source authenticity, or test future changed datasets. Comparison exports lack stable IDs, so the verifier checks fixture-name uniqueness before matching these known rows. This is not a name-based import identity strategy. The graph export is a relationship projection, not a full backup.

## Browser task evidence

| Task | Screenshots | Downloads and text evidence |
| --- | --- | --- |
| Priorities/accountability | [Overview](02-overview.png), [all five top projects](03-top-projects.png), [opening detail](04-opening-detail.png) | [Top projects CSV](top-projects.csv); browser logs 008–016 |
| Intervention | [Five projects](09-attention-projects.png), [AI research detail](10-ai-research-detail.png) | [Attention CSV](attention-projects.csv); logs 048–055 |
| Leader rollup | [Marcus teams](11-marcus-rollup.png), [comparison](12-marcus-comparison.png), [map](13-marcus-map.png), [focused grid](14-marcus-focused-grid.png) | [Marcus CSV](marcus-projects.csv); logs 067–087 |
| Dependencies | [Components map](07b-components-map.png), [Components detail cap](08-components-related-truncation.png), [AI standards grid connections](15-ai-standards-grid-connections.png), [AI research detail](10-ai-research-detail.png) | [Example graph](example-graph.jsonld), [relationship investigation](relationship-investigation.md); logs 035–040 and 089–095 |
| Capacity | [Committed](16-capacity-committed.png), [with proposed](17-capacity-proposed.png), [expanded proposal effort](19-proposal-effort-expanded.png) | [Committed CSV](capacity-committed.csv), [proposed CSV](capacity-proposed.csv), [committed DOM labels](capacity-dom-committed.json), [proposed DOM labels](capacity-dom-proposed.json); logs 098–119 |
| Import | [Baseline](20-import-baseline.png), [review](21-import-review.png), [invalid manager](22-invalid-manager.png), [invalid status](23-invalid-status.png), [after reload](24-imported-after-reload.png), [map](25-imported-project-map.png), [grid](26-imported-project-grid.png), [detail](27-imported-project-detail.png), [leader](28-imported-leader-rollup.png) | [Baseline API snapshot](import-baseline-persisted.json), [review without save](import-review-unsaved.json), [manager rejection state](import-invalid-manager-unsaved.json), [status rejection state](import-invalid-status-unsaved.json), [saved Plan](import-after-save.json), [UI graph](imported-graph.jsonld), [API graph](import-api-graph.jsonld); logs 121–172 |

[Browser action log](browser-actions.jsonl) records exact commands, results and their text-output paths in [browser-logs](browser-logs). Initial errors/console logs 005–006 and final 173–174 are empty. The same dedicated session was used, with one recovery described below. Full-page screenshots do not expand nested dialog scroll areas; snapshots and `get text` captures include additional dialog content.

## Environment and diagnostic records

The current working tree was copied to `/tmp/periscope-utility-review-20260912`, excluding the user's saved database, environment files and previous build output. It used the same locked dependencies and `DATABASE_PATH=/tmp/periscope-utility-review-20260912/test-data/planner.sqlite`, with a production server on port 3021. Tasks 1–5 used session-only example data. Task 6 seeded and wrote only this disposable database. The dedicated browser session `periscope-utility-review` and evaluation server were closed after completion; the original port-3000 preview remained running and returned HTTP 200.

The [browser wrapper](browser.py) records tool calls; its CLI path is specific to this machine. It was updated during evaluation to scroll target controls into view before interaction. Diagnostic records are retained to avoid presenting failed automation as product behavior:

- `05-components-detail.png` and `07-components-map.png` were named for an intended click but still show the opening project because the target was offscreen. **Do not use them as Components evidence.** Use `07b-components-map.png` and `08-components-related-truncation.png`. Log 029 and `07a-connection-visible.png` establish the offscreen cause; scrolling then clicking navigated correctly.
- Logs 057–065 and `browser-recovery-state.png` document a stalled snapshot followed by the session being at `about:blank`. The isolated server still returned 200. Reopening the owned tab recovered the task; the cause of the tab state is unconfirmed.
- [Initial build setup error](build-setup-error.log) records Turbopack rejecting the external node_modules symlink in the disposable copy. Replacing that symlink with a local copy of the locked dependencies produced the successful build above. No app change was required.

These are evaluation artifacts, not an automated enterprise import, a demo recording or a production readiness certification.

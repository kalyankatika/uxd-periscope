# Onboarding review evidence

September 19, 2026. All application records shown are fictional. [Walkthrough, results and repeatable scenario](../../docs/onboarding-walkthrough.md).

- `browser-actions.jsonl` and `browser-logs/`: observed interactions, text and snapshots, including automation failures.
- `01-nested-report.png`: Nina’s project scope.
- `03-new-hire-grid.png`: persisted fictional hire found in reporting Grid.
- `04-import-guidance.png`, `05-mobile-import.png`: updated sample download and persistence guidance.
- `06-person-availability.png`: capacity defaults disclosed before saving.
- `persistence-check.json`: isolated workspace record counts and manager ID after reload.
- `saved-data-before.json`, `saved-data-integrity.json`: original database file hashes; no record contents.
- `tests.log`, `build.log`: verification for the integrated improvements.

The original 02 import-review screenshot attempt stalled with the automation engine and did not produce an image. Visible-text logs record the successful retry. The `browser.py` helper logs interactions and scrolls controls into view; its executable path is local to this machine.

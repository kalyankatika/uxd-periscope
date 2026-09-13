# People and reporting verification

All interactions use a disposable repository copy and SQLite database on port 3024. The baseline is the committed fictional UXD JSON pack, seeded through the revision-checked API. The user's normal workspace was not used for write tests.

## Verified flow

- Created Taylor Stone through **＋ Report** under Marcus Reed. Manager and team prefilled. Research discipline, 0.83 FTE and 12.5% other work saved correctly.
- Used actual pointer mouse-down/move/up on the drag handle to move Marcus onto Riley Thompson. Dropping opened a review without saving. Self/descendant options were excluded. Confirmed optional team adoption changed Marcus and all four reports to UX AI, kept reports under Marcus, and preserved every project field.
- Opened Riley's team and confirmed Marcus and his project scope appeared there. Removed Marcus after reviewing four reports; all four moved to Riley and every project remained.
- Removed Ethan Park with one owned project and two contributor assignments. Reassigned Research repository to Amara; removed Ethan's contributor links. All 13 projects, effort and dependencies remained.
- Activated Taylor's Move button with Enter; moved to no manager without changing team or project records.
- Cancelled Taylor's removal. All records and revision stayed unchanged.
- Opened Taylor's editor, then advanced the isolated saved revision in a separate API request. The attempted stale edit reached the API (including valid decimal availability in closed details), was rejected, stayed visible with an error, and did not overwrite newer records.
- Reloaded and restarted the entire isolated server. The complete Plan remained identical at revision 7: 25 people and 13 projects. The graph contained 45 nodes; removed people were absent and reparented reporting links were correct.
- Edited the built-in example through the same UI. Example-only notice appeared; the saved API Plan remained unchanged.
- Inspected desktop and 390-pixel mobile screenshots. Mobile content width was 390 pixels, row actions remained accessible, and the modal fit the viewport. Browser runtime errors and error overlays were absent.

## Evidence

- `tests.log`: all 57 tests pass (12 new hierarchy tests), including immutable operations, duplicate names, invalid IDs, cycles, nested subtree moves, project reassignment and legacy-owner clearing.
- `build.log`: production build from the isolated copy; `preview-build.log`: current checkout build for port 3000.
- `browser-actions.jsonl`, `browser-logs/`, and screenshots: actual UI steps; the test browser was closed after verification.
- `baseline.json`, `moved.json`, `removed.json`, `owner-removed.json`, `root-move.json`, `cancelled.json`, `newer-revision.json`, `reloaded.json`: fictional API records at checkpoints.
- `check.py`: read-only checkpoint assertions. Records are compared by authoritative IDs because SQLite GET sorting can differ from PUT response order. An initial order-sensitive comparison was corrected; the combined creation/move checkpoint validates every resulting record against the baseline by ID.
- `graph.jsonld`, `verification.json`, `example-isolation.json`, `preservation.json`: final integrity and isolation checks. Only hashes of the user's saved workspace are recorded; no saved user records were exported.

## Review and limits

An independent agent implemented and tested the pure operations, then reviewed the UI. Its decimal-step finding was fixed with `step="any"`; schema bounds remain enforced. The manager verified the complete browser → API → SQLite → reload flow.

Reporting moves change manager relationships, not sibling display order. Team-label adoption is optional and applies to the entire moved reporting group. Deletion removes only the selected person; projects remain. There is no edit history or undo feature. Changes in example mode are temporary. No live enterprise integration or authentication was added.

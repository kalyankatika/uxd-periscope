# Enterprise data mapping

This document is the **implemented local CSV contract**. The [enterprise connector assessment](enterprise-connectors.md) describes proposed API/JSON ingestion and source authority; its illustrative JSON envelope is not accepted by this version of the application. See the [enterprise product assessment](enterprise-product-assessment.md) for generic domain, time and financial extensions.

Periscope currently runs locally. The example organization and demo video contain fictional records. No real enterprise data source is connected or synchronized.

The repository includes a complete [fictional UXD data pack](../examples/uxd-demo/README.md) with importable people/projects CSVs and an equivalent canonical `workspace.json`. Use the CSV pair in the current UI. The JSON file is a developer reference for the existing Plan model, not a supported generic JSON upload or the proposed connector envelope. The pack's metadata is kept in a separate manifest so it cannot be mistaken for imported project fields.

## Future enterprise requirement: read-only source-backed data

Captured from the user on September 20, 2026. This is a future product requirement, not an implemented permission mode.

- Provide an enterprise read-only experience for imported/source-backed people, reporting structures, projects, priorities and related data. Authoritative changes are made in the originating platforms.
- Replace source-backed create/edit/delete and hierarchy-move actions with “Open in source” links where a verified source URL is available. Do not silently write back or create local overrides of source-owned fields.
- Preserve source system, stable source record ID, field authority where sources overlap, and last successful refresh metadata. Show stale or unavailable data honestly; opening the source does not imply a refresh has happened.
- Enforce read-only access at the server/API boundary as well as in the interface. Ingestion uses separately authorized service access; viewer access cannot mutate imported records. Source platforms retain their own edit permissions.
- Keep fictional demo changes session-only. Existing local/manual editing remains a separate mode; it must never be mistaken for changes to connected enterprise records. Any future scenarios or annotations must be explicitly separate from source facts.
- Connector mappings and refresh behavior require actual enterprise sources and agreed contracts. No live synchronization or read-only enforcement is currently implemented.

Acceptance for the future mode: source-backed mutation requests are rejected; viewers can navigate and inspect permitted data; verified source links open the matching record; refreshed data reflects upstream changes without local edits; demo/manual mode is visibly distinct.

## Source contract

Use an authoritative directory for people and reporting relationships, and an authoritative project register for projects. Include the complete project register in the source export; the selected quarter filters views without deleting projects outside that period.

- Use stable employee or directory IDs for people, and stable source-system IDs for projects. Preserve leading zeros and case. Do not use display names as join keys.
- Assign `managerId`, `leadId`, `memberIds`, and `dependsOn` using those IDs. Separate multiple contributor or dependency IDs with `|`.
- Use one exact display label per team and business priority. The import review blocks labels that differ only by case or repeated whitespace, such as `Product Design` and `product design`.
- Keep teams distinct from disciplines. `UX AI`, `Innovation`, and `Design Strategy` are team labels. An individual still has a discipline such as Design, Research, Content, or Design engineering for capacity calculations.
- Dates must be ISO `YYYY-MM-DD`. Working time uses full-time equivalents; `nonProjectPct` is a number from 0 to 100. Unknown labels and ambiguous dates are rejected, rather than guessed.

## Column and label mappings

Both canonical field names and recognized display labels are accepted. Examples:

| Source column | Stored field |
| --- | --- |
| Employee ID / Person ID | `id` on a person |
| Full name / Employee name | `name` |
| Discipline | `craft` |
| Manager ID / Reports to ID | `managerId` |
| Project ID | `id` on a project |
| Project owner ID / Owner ID | `leadId` |
| Contributor IDs | `memberIds` |
| Dependency IDs | `dependsOn` |
| Business priority | `priority` |
| Project health | `health` |
| Delivery status | `delivery` |
| Commitment | `status` |

`Status` is the canonical commitment field, not a catch-all delivery state. If a source uses Status for In progress or Completed, rename that column to Delivery status.

Recognized value conversions include Product Design → `design`, Content Design → `content`, Design Engineering → `design_eng`, Backlog → `stretch`, At risk → `at_risk`, and Decision required → `needs_decision`. The review displays every conversion. Arbitrary abbreviations or new source-system labels require an explicit mapping update. Columns without recognized mappings are listed as excluded; they are not imported.

## Import procedure

1. Reconcile IDs and canonical team/priority labels in the source files. Include the full people roster and all projects, including projects outside the displayed quarter.
2. Open **People & imports → Import organization**. Choose a **People CSV** and a **Projects CSV**, then select **Merge by ID** or **Replace people and projects**. Each file can be up to 2 MB; the resulting serialized workspace must also fit the API's 2 MB save limit.
3. Select **Review organization**. Review new, updated, removed, and resulting totals for both datasets. Expand each file's section to inspect column mappings, value conversions, excluded columns, and the first five record names. Every row is validated, not just the preview.
4. Correct missing IDs, reporting cycles, invalid project links, and conflicting labels in the source. Validation checks the final combined organization, so project owners and contributors may refer to people in the accompanying file. References never resolve by display name. Import is disabled while errors remain.
5. Confirm **Import organization**. Both datasets save in one revision-checked SQLite transaction, or neither changes. Cancel or close the review to leave the workspace unchanged. Merge keeps omitted existing IDs; replace removes omitted people and projects from both datasets. Imported records are complete replacements: omitted optional columns use their defaults. All dates are imported; the quarter only filters views.
6. Reconcile total people/project counts against the source and inspect each leadership team in **Teams & reporting**, **Work map**, and **Grid**. Review unassigned project owners, project date coverage, shared contributors, and dependencies.
7. Export the resulting CSVs and JSON-LD as a reconciliation snapshot. Record source system, extraction date, source owner, and any approved mapping exceptions outside the demo dataset.

For an update to only one dataset, use **Import or export one file** below the organization form. Choose People or Projects and **Upload CSV**. A single-file import validates against the other dataset already in the workspace. Import new people before projects that reference them. Use the combined organization import when replacing both connected datasets, to avoid invalid intermediate references to the previous roster or projects.

The saved-workspace API checks revisions to prevent a stale session from overwriting a newer save. Example mode updates only the current session. Automated enterprise synchronization, authentication, and source connectors are separate work requiring the actual source and its data contract.

## Manual people and hierarchy changes

Open **Teams & reporting** (also linked from **People & imports → Manage people & reporting**).

- **Add person** creates a new local record with a generated stable ID. **＋ Report** on a person, or **Add direct report** in their team view, preselects that manager and team. Imported IDs stay unchanged when editing existing people.
- **Edit** updates a person's name, role, team, reporting relationship, discipline and availability. Names are labels; changes do not re-key projects or reporting lines.
- **Move** selects a new manager or **No manager in this workspace**. You can also drag the handle onto a manager, or the top-level drop area, to open the same review. Save explicitly to apply the move. A person's own reports stay with them; project assignments stay intact. The optional team checkbox updates the moved person and every descendant to the destination manager's team label. By default, team labels are preserved. Self-reporting and moves under descendants are blocked.
- **Edit → Remove person** shows direct reports, owned projects and contributor assignments. Choose a surviving manager for the direct reports, or place them at the top level. Choose a replacement owner for owned projects, or leave their owners unassigned. Only the selected person is deleted; their contributor IDs are removed and their capacity is removed from totals. All projects, effort, dependencies and remaining people are retained. Unassigned projects have their old legacy owner text cleared so the removed person is not displayed as their owner.

Manual updates use the same complete-plan validation and revision-checked save as imports. Saved-workspace changes survive reload; example edits remain session-only. A later source import can replace manually edited records with the imported values. Source precedence, edit history and automatic reconciliation are not implemented.

## Nested reporting example

The fictional fixture includes four levels: Avery Morgan → Elena Brooks → Maya Chen → Nina Patel. Relationships use `managerId` values `uxd-head` → `elena` → `maya` → `nina` (each child references the preceding manager). In Work map, choose **Reporting lines**, select a person and use **Show reporting group** to see every descendant. The inspector separates direct and indirect reports; selecting either opens that person's scope. Project totals include nested reports and deduplicate shared projects by ID. Map and Grid use the same reporting filter.

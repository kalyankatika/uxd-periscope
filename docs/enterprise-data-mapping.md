# Enterprise data mapping

Periscope currently runs locally. The example organization and demo video contain fictional records. No real enterprise data source is connected or synchronized.

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

1. Reconcile IDs and canonical team/priority labels in the source files. Import the people roster before projects that reference it. Upload the full set of interdependent projects together.
2. Open **People & imports** and choose People or Projects. Select **Upload CSV**. The current limit is 2 MB per file.
3. Review column mappings, value conversions, excluded columns, record counts, and the first five record names. Validation applies to every row, not just the preview.
4. Correct missing IDs, reporting cycles, invalid project links, and conflicting labels in the source. Import is disabled while these errors remain.
5. Confirm the import. Merge adds or replaces records by ID and keeps omitted existing IDs. Replace removes omitted records in the selected dataset. Imported records are complete replacements: optional columns omitted from an updated record use their documented defaults.
6. Reconcile total people/project counts against the source and inspect each leadership team. Review unassigned project owners, project date coverage, shared contributors, and dependencies.
7. Export the resulting CSVs and JSON-LD as a reconciliation snapshot. Record source system, extraction date, source owner, and any approved mapping exceptions outside the demo dataset.

The saved-workspace API checks revisions to prevent a stale session from overwriting a newer save. Example mode updates only the current session. Automated enterprise synchronization, authentication, and source connectors are separate work requiring the actual source and its data contract.

# Fictional import scenario and expected answers

Prepared before the manager's browser import evaluation on 2026-09-12. These expectations come from the CSV records, not app totals or graph helper results. Every name and record here is fictional. These files are for an isolated database; do not import them into the user's saved workspace.

## Baseline

`baseline-plan.json` is the same five-person, three-project organization as `baseline-people.csv` plus `baseline-projects.csv`. Its revision is an initial fixture value, not authorization to overwrite another database. When using the API to seed the isolated test database, use that database's current revision.

| Person ID | Name | Reports to | Role |
| --- | --- | --- | --- |
| 0001 | Dana Ellis | No manager | Head of UXD |
| 0010 | Avery Shah | 0001 | VP Product Design |
| 0011 | Sam Rivera | 0010 | Product Designer |
| 0020 | Robin Lee | 0001 | VP Research |
| 0021 | Morgan Patel | 0020 | Researcher |

| Project ID | Name | Accountable owner | Contributors | Depends on |
| --- | --- | --- | --- | --- |
| UX-001 | Onboarding redesign | 0010 | 0011, 0021 | UX-002 |
| UX-002 | Onboarding research | 0020 | 0021 | None |
| UX-003 | Component accessibility | 0011 | 0011 | None |

UX-001 is top priority and needs a scope decision. UX-003 is at risk because accessibility review slots are unconfirmed. UX-001 and UX-002 support “Reduce onboarding friction”; UX-003 supports “Accessible experiences.” All three are committed and overlap Q4 2026.

Avery's baseline rollup contains UX-001 and UX-003 once each. Robin's contains UX-001 and UX-002 once each. Dana's contains all three once each. UX-001 is shared across Avery and Robin through contributor 0021; adding leaders' separate totals would double-count that project.

## Valid update — Merge by ID

Select `update-people.csv` and `update-projects.csv`, with **Merge by ID**. This intentionally imports a subset so that retention of omitted records is observable.

| Dataset | In file | New | Updated | Removed | After import |
| --- | ---: | ---: | ---: | ---: | ---: |
| People | 2 | 1 | 1 | 0 | 6 |
| Projects | 2 | 1 | 1 | 0 | 4 |

Expected changes:

- Person **0010** changes name from Avery Shah to **Avery Chen**, retaining manager 0001, leadership, team and job title. The ID must retain its leading zeros.
- Person **0030 Taylor Brooks** is added in team UX AI, discipline Design, reporting to **0010**.
- UX-001 remains owned by **0010**, now displayed as Avery Chen. Contributors become **0011, 0021, 0030**. Dependency **UX-002** is unchanged. Health becomes **On track**, Action required becomes empty, and Latest update becomes “Scope approved; testing is booked.” Importance remains Top and commitment remains Committed.
- **UX-004 UX AI assistance prototype** is added as Proposed, owner **0030**, contributor **0011**, dependency **UX-003**, business priority **UX AI**, delivery **Planned**, health **No update yet**.
- Omitted people **0001, 0011, 0020, 0021** and projects **UX-002, UX-003** remain unchanged.
- Avery's updated rollup contains **UX-001, UX-003, UX-004** once each. Robin's still contains **UX-001, UX-002** once each. Dana's contains all four once each. Filtering committed projects excludes UX-004.
- Review and cancel do not mutate the baseline. Confirm saves both files in one new revision. Reload must retain the new name, people, projects and relationships in the isolated saved workspace.

**Do not use Replace for this subset.** Replace would omit referenced people 0001/0011/0020/0021 and projects UX-002/UX-003. The final combined plan should be blocked for unresolved references. Replace is suitable only for a complete organization export.

## Mapping review expectations

Every source file has a deliberate unmapped **Source note** column. The review should list it as excluded, not silently store it. There is no interactive way to select an alternative target in this version; mappings are recognized aliases.

People column mappings:

| Source header | UI field | Internal field |
| --- | --- | --- |
| Employee ID | Record ID | id |
| Full name | Name | name |
| Discipline | Discipline | craft |
| Working time (FTE) | Working time (FTE) | fte |
| Non-project time (%) | Non-project time (%) | nonProjectPct |
| Job title | Job title | title |
| Team | Team | team |
| Manager ID | Manager ID | managerId |
| Leader | Leader | isLeader |

Project headers are supported display labels: Project ID → Record ID (`id`), Project name → Name (`name`), Start date → `start`, End date → `end`, Commitment → `status`, the four effort columns → the four craft effort values, Project owner ID → `leadId`, Contributor IDs → `memberIds`, Dependency IDs → `dependsOn`, Importance → `importance`, Project health → `health`, Action required → `decision`, Latest update → `update`, Business priority → `priority`, Expected outcome → `summary`, Delivery status → `delivery`.

Value conversions expected in update review: Product Design → design; Yes → true; No → false; Committed → committed; Proposed → proposed; Top priority → top; Normal → normal; On track → on_track; No update yet → not_reported; In progress → in_progress; Planned → planned. Multi-ID cells use `|`; they preserve exact IDs.

## Invalid update variants

1. Use `invalid-missing-manager-people.csv` with valid `update-projects.csv`. Taylor's Manager ID is **0999**, which does not exist. Review must show **Unknown manager for Taylor Brooks** and disable Import organization. Closing the review must leave saved records and revision unchanged.
2. Use valid `update-people.csv` with `invalid-status-projects.csv`. UX-004's Commitment is **In delivery**, which is not a supported commitment label. Parsing must fail with **Row 3: Unrecognized Commitment label “In delivery”** (the UI prefixes the project filename). A review containing a valid-to-import plan must not open; no data may save.
3. Optional repeat import after a successful update: same full records should retain all relationships, but the current preview will show two Updated rows per dataset even when their values are identical. “Updated” means matched IDs, not a field-level change count. Do not mistake this for a true before/after diff.

## Evidence boundary

This document defines the expected outcomes. Actual browser behavior, screenshots and API/save evidence belong in the manager's evaluation report. Focused unit/API tests corroborate specific mechanics and do not independently prove that a leader understands the interface.

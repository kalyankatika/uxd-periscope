# Related-project investigation

This is a read-only investigation of the current product using the fictional fixture in [example-plan.json](example-plan.json). Findings below come from source inspection and independent enumeration of that fixture. They do not assert browser confirmation of truncation; the manager evaluates that separately. No application code or saved workspace was changed.

## Corrected navigation observation

An initial browser attempt appeared to leave the Account opening redesign dialog unchanged after clicking its Accessible component library related row. The manager subsequently established that the browser tool had reported a click without scrolling the offscreen target into view: its bounding box was at `y=1379` in a viewport of height `1000`. After explicit `scrollintoview`, clicking selected the component library correctly. **This was a browser-automation limitation; no product navigation failure was established.**

Code inspection is consistent with working navigation: [app/leadership.tsx:925](../../app/leadership.tsx#L925) sets `projectId` to the clicked stable project ID; [line 131](../../app/leadership.tsx#L131) derives the selected record; [line 793](../../app/leadership.tsx#L793) renders its name. The project dialog is not inside a form. Related rows use `project.id` as their React key at line 924.

## Dependency truncation

[lib/work-graph.ts:50–69](../../lib/work-graph.ts#L50) returns related projects in the original `plan.initiatives` order. Dependency reasons are added at lines 56–59, same-priority at lines 60–62, and shared-person reasons at lines 63–66. The function does not sort by relationship importance.

[app/leadership.tsx:919–930](../../app/leadership.tsx#L919) renders only `.slice(0, 4)` at line 920, without a total count or a control to show the omitted rows. Thus earlier same-priority/shared-person rows can displace a direct prerequisite or dependent.

### Every project, in fixture order

| Selected project ID | Related count | Four rows rendered, in order | Rows omitted by cap |
|---|---:|---|---|
| `opening` | 6 | `advisor`, `components`, `mobile`, `experience-strategy` | `conversational-prototype` (shared people), `ai-standards` (shared people) |
| `advisor` | 4 | `opening`, `components`, `experience-strategy`, `ai-standards` | None |
| `retirement` | 5 | `mobile`, `statements`, `coaching`, `experience-strategy` | `ai-research` (shared people) |
| `components` | 7 | `opening`, `advisor`, `insights`, `mobile` | `coaching` (shared people), `ai-standards` (dependent, shared people), `ai-research` (same priority) |
| `insights` | 3 | `components`, `conversational-prototype`, `ai-research` | None |
| `mobile` | 6 | `opening`, `retirement`, `components`, `statements` | `coaching` (same priority), `conversational-prototype` (shared people) |
| `statements` | 4 | `retirement`, `mobile`, `coaching`, `experience-strategy` | None |
| `coaching` | 5 | `retirement`, `components`, `mobile`, `statements` | `innovation-lab` (shared people) |
| `experience-strategy` | 5 | `opening`, `advisor`, `retirement`, `statements` | `innovation-lab` (dependent, shared people) |
| `innovation-lab` | 3 | `coaching`, `experience-strategy`, `conversational-prototype` | None |
| `conversational-prototype` | 6 | `opening`, `insights`, `mobile`, `innovation-lab` | `ai-standards` (prerequisite), `ai-research` (shared people) |
| `ai-standards` | 5 | `opening`, `advisor`, `components`, `conversational-prototype` | `ai-research` (dependent) |
| `ai-research` | 5 | `retirement`, `components`, `insights`, `conversational-prototype` | `ai-standards` (prerequisite) |

**9 of 13** project lists are truncated. **5 selected-project lists** omit a direct dependency relationship, representing four distinct dependency edges (the AI standards / AI research edge is hidden from both endpoints):

| Selected project | Hidden project | Relationship to selected project | Position in uncapped list |
|---|---|---|---:|
| `components` — Accessible component library | `ai-standards` — UX AI interaction standards | dependent | 6 of 7 |
| `experience-strategy` — UXD product design strategy | `innovation-lab` — Service concept pilots | dependent | 5 of 5 |
| `conversational-prototype` — Conversational planning prototype | `ai-standards` — UX AI interaction standards | prerequisite | 5 of 6 |
| `ai-standards` — UX AI interaction standards | `ai-research` — AI-assisted research synthesis | dependent | 5 of 5 |
| `ai-research` — AI-assisted research synthesis | `ai-standards` — UX AI interaction standards | prerequisite | 5 of 5 |

Example: `conversational-prototype.dependsOn = ["ai-standards"]`, but the first four related rows are `opening` (shared people), `insights` (shared people), `mobile` (shared people), and `innovation-lab` (same priority). The only direct prerequisite, `ai-standards`, is fifth and omitted.

The Account opening row for `components` is second, so it is not truncated. This is separate from the corrected browser-tool click observation.

## Shared-person relationship excludes opposite roles

At [lib/work-graph.ts:63–64](../../lib/work-graph.ts#L63), the implementation recognizes a shared lead or the intersection of both contributor arrays. It does not compare one project’s lead against the other project’s contributors.

Concrete record evidence:

- `opening.leadId = "maya"`; `opening.memberIds = ["sofia", "leo", "oliver"]`.
- `retirement.leadId = "leo"`; `retirement.memberIds = ["ethan", "maya"]`.
- Both projects involve Maya and Leo, each serving as lead in one project and contributor in the other. They have different priorities and no direct dependency, so the current related-project function excludes the pair entirely.

Independent set comparison of `{leadId} ∪ memberIds` finds **19 unordered project pairs** with shared people that the current shared-person condition misses. Of those, **13 have no other recognized relation**, so the related-project helper omits the pair entirely in both directions; six remain related through priority/dependency but lack the shared-person reason. These counts are calculated before the four-row display cap.

| First project | Second project | Shared person IDs missed | Other relationship keeps pair in uncapped result? |
|---|---|---|---|
| `opening` | `retirement` | `leo`, `maya` | No; pair omitted entirely |
| `opening` | `components` | `oliver` | Yes; shared-person reason still missing |
| `opening` | `statements` | `maya` | No; pair omitted entirely |
| `advisor` | `insights` | `jordan` | No; pair omitted entirely |
| `advisor` | `statements` | `grace` | No; pair omitted entirely |
| `retirement` | `insights` | `ethan` | No; pair omitted entirely |
| `retirement` | `mobile` | `leo` | Yes; shared-person reason still missing |
| `retirement` | `conversational-prototype` | `leo` | No; pair omitted entirely |
| `components` | `statements` | `grace` | No; pair omitted entirely |
| `insights` | `coaching` | `amara` | No; pair omitted entirely |
| `mobile` | `coaching` | `nina` | Yes; shared-person reason still missing |
| `mobile` | `innovation-lab` | `nina` | No; pair omitted entirely |
| `statements` | `ai-standards` | `grace` | No; pair omitted entirely |
| `coaching` | `conversational-prototype` | `amara` | No; pair omitted entirely |
| `coaching` | `ai-research` | `amara` | No; pair omitted entirely |
| `experience-strategy` | `ai-research` | `tessa` | No; pair omitted entirely |
| `innovation-lab` | `conversational-prototype` | `ben` | Yes; shared-person reason still missing |
| `conversational-prototype` | `ai-standards` | `aisha` | Yes; shared-person reason still missing |
| `ai-standards` | `ai-research` | `sam` | Yes; shared-person reason still missing |

## Evidence limits

- Fixture IDs and memberships were read from the unmodified fictional Plan; the source file and fixture hashes are recorded in [expected-answers.md](expected-answers.md).
- Enumeration follows the inspected related-project conditions and independently compares full participant sets. It is not a browser test or a production-data finding.
- Map/grid/details/export agreement must be established separately. These findings concern the project dialog’s related list and the helper that supplies it.
- Findings are recorded for the evaluation; no fixes or redesign were made.

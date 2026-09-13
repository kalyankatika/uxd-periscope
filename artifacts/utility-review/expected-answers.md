# Independent leadership task answers

These answers were defined from the fictional example records before inspecting browser results. They are an evaluation oracle, not evidence that the interface exposes the answer. No saved workspace, database, server, UI output, graph helper, reporting-rollup helper, allocation helper or capacity helper was used.

## Source and method

- Source: `lib/leadership-demo.ts`, returned by `leadershipDemo()` with its normal schema defaults; the exact returned Plan is saved as [example-plan.json](example-plan.json).
- Independent arithmetic: Python standard-library `datetime` and `fractions.Fraction`; reporting traversal follows `managerId`; project membership is the set union of `leadId` and `memberIds`; results are deduplicated by project ID. No name matching.
- Period: inclusive October 1–December 31, 2026. Project demand uses weekdays only, at one fifth of a full-week FTE per weekday. Available capacity follows the published README rule: full weekly baseline, including the boundary weeks.
- Counts: 26 people, 13 projects, 7 business-priority labels, 7 functional leaders plus head Avery Morgan. Commitment: 12 committed, 1 proposed, 0 backlog (`stretch`). Delivery: 11 in progress, 1 completed, 1 planned, 0 blocked.
- Exact machine-readable answers, supporting people, memberships, per-project weekday calculations and every scenario week: [expected-answers.json](expected-answers.json).
- Example Plan SHA-256: `fa050d97ec2e0b565f8b014d17a7d8f50ea4385b0e0d5bbf3254500cc40ee5ab`.
- Raw example source SHA-256: `662b3d54e1ecfec0241a0b6e793159eac8d95a5876e8c138368972c45e188afb`.
- Domain source SHA-256: `4f5dc28951dfaa3b449b7157d74075b2b5d139237051d1d3ea3eb833c835ccb2`.

## Task 1: What matters most, and who is accountable?

Expected answer: five projects are explicitly marked `importance: top`. This is the recorded prioritization, not a ranking independently justified by value, spend or urgency. The accountable person comes from `leadId`; their manager is a separate relationship.

| Project ID / name | Priority | Accountable lead ID / name | Recorded health |
|---|---|---|---|
| `opening` — Account opening redesign | Client onboarding | `maya` — Maya Chen | `needs_decision` |
| `advisor` — Advisor workspace | Advisor productivity | `jordan` — Jordan Ellis | `on_track` |
| `retirement` — Retirement guidance | Client financial planning | `leo` — Leo Martinez | `at_risk` |
| `experience-strategy` — UXD product design strategy | Product experience alignment | `tessa` — Tessa Wu | `on_track` |
| `ai-standards` — UX AI interaction standards | Responsible AI experiences | `aisha` — Aisha Patel | `on_track` |

Supporting records are the five project objects and the five lead-person objects in the fixture. There is no ordered rank among these five, numerical business-value evidence, decision-authority assignment or update timestamp. The data supports “these are designated top projects,” not “this is demonstrably the most valuable investment.”

## Task 2: What needs intervention, and why?

Expected answer: five distinct projects meet the explicit condition `health in {at_risk, needs_decision} OR delivery == blocked`: two need a decision and three are at risk. No project is blocked. These are reported conditions; capacity arithmetic is evaluated separately.

| Project / accountable lead | Recorded signal and reason | Explicit decision text |
|---|---|---|
| `opening` — Account opening redesign; Maya Chen | `needs_decision`. The shorter application has been tested. The team is ready to finalize the identity-check experience. | Decide whether the new identity check belongs in this release or the next one. |
| `retirement` — Retirement guidance; Leo Martinez | `at_risk`. Participant recruitment is slower than expected. The research lead is adjusting the interview plan. | None supplied. |
| `mobile` — Mobile portfolio overview; Nina Patel | `at_risk`. The design is progressing, but delivery depends on shared chart and accessibility components. | None supplied. |
| `conversational-prototype` — Conversational planning prototype; Ben Carter | `needs_decision`. Two interaction approaches have been tested with internal reviewers. Client testing is awaiting a scope decision. | Select one concept and approve the client-testing scope for the next pilot. |
| `ai-research` — AI-assisted research synthesis; Sam Okafor | `at_risk`. The evaluation tool is ready, but preparation of the de-identified research dataset is behind schedule. | Confirm researcher availability for dataset review before the pilot starts. |

`coaching` is proposed/planned with `health: not_reported`, so its absence of a health report is not evidence of an active delivery problem. The records provide no decision owner distinct from the project lead, requested decision date, update age, severity/impact, mitigation owner or decision resolution. Two at-risk projects have no explicit requested action.

## Task 3: What rolls up to a leader without double-counting?

Use **Marcus Reed (`marcus`)** for the strongest duplicate test. His reporting scope is `marcus`, `sofia`, `ethan`, `amara`. The expected union is **8 projects from 10 person-project memberships**. Both Research repository and AI-assisted research synthesis involve Ethan and Amara, but count once each.

| Project ID / name | People in Marcus’s scope | Accountable lead in scope? |
|---|---|---|
| `opening` — Account opening redesign | `sofia` | No; contribution only |
| `advisor` — Advisor workspace | `sofia` | No; contribution only |
| `retirement` — Retirement guidance | `ethan` | No; contribution only |
| `insights` — Research repository | `amara`, `ethan` | Yes |
| `coaching` — Planning assistant discovery | `amara` | Yes |
| `experience-strategy` — UXD product design strategy | `sofia` | No; contribution only |
| `conversational-prototype` — Conversational planning prototype | `amara` | No; contribution only |
| `ai-research` — AI-assisted research synthesis | `amara`, `ethan` | No; contribution only |

Marcus has four top-importance projects (`opening`, `advisor`, `retirement`, `experience-strategy`), four intervention projects (`opening`, `retirement`, `conversational-prototype`, `ai-research`), and seven active committed projects plus proposed `coaching`. “Projects involving the team” must not be read as “projects the leader directly owns.”

Additional independently enumerated checks:

- **Elena Brooks (`elena`)** with `maya`, `jordan`, `nina`: 9 projects — `opening`, `advisor`, `retirement`, `insights`, `mobile`, `statements`, `coaching`, `experience-strategy`, `innovation-lab`. Three have a lead within the reporting scope; six are contribution only. This set includes completed `statements` and proposed `coaching`; 7 are active committed projects.
- **Maya Chen (`maya`)**: 4 projects — `opening`, `retirement`, `statements`, `experience-strategy`. She is not a reporting leader and has no reports in the fixture.
- **Daniel Kim (`daniel`)**: 5 projects from 6 memberships. `components` must count once even though both `oliver` and `isabel` are involved.
- **Avery Morgan (`uxd-head`)**: all 26 people; 13 projects from 45 memberships. The seven functional leader counts are 9, 8, 8, 5, 3, 2, 3: their sum is 38, not the organization project count. Shared work must not be summed across leaders.

## Task 4: Which dependencies could affect a priority?

Use **Responsible AI experiences**. Its sole project is `ai-standards` (UX AI interaction standards), led by Aisha Patel. It directly depends on `components` (Accessible component library), led by Oliver Grant. Thus a problem with that prerequisite can affect the priority even while `ai-standards` is reported on track. Both current records report on track; this is a recorded dependency exposure, not proof of a current dependency failure.

The complete edge set, written prerequisite → dependent, is:

| Prerequisite | Dependent |
|---|---|
| `components` | `opening` |
| `components` | `mobile` |
| `experience-strategy` | `innovation-lab` |
| `ai-standards` | `conversational-prototype` |
| `components` | `ai-standards` |
| `insights` | `ai-research` |
| `ai-standards` | `ai-research` |

Expected reverse impact: `components` has five downstream projects: `opening`, `mobile`, `ai-standards`, `conversational-prototype`, `ai-research`. The final two are indirect through `ai-standards`. `ai-research` has three unique upstream projects: direct `insights` and `ai-standards`, plus indirect `components`. It must not display a duplicated prerequisite if multiple paths are later present.

`components` ends December 18 while some dependents end earlier. The records have no dependency milestone, type, lag, required-by date or delivery contract. Do not infer a finish-to-start scheduling violation: phased component availability could be intended. Task success requires distinguishing the known relationship from an unrecorded schedule impact.

## Task 5: What changes when proposed work is included?

There is one proposed project: **Planning assistant discovery (`coaching`)**, November 16–December 31. Its requested full-week effort is Design 0.4, Research 0.4, Content 0.2, Design engineering 0.3. There are 34 inclusive weekdays in that interval, so the proposal adds **8.84 FTE-weeks**: 2.72 Design + 2.72 Research + 1.36 Content + 2.04 Design engineering. It does not add available capacity.

Availability independently computed as the sum of each person’s `fte × (1 − nonProjectPct / 100)` is 6.25 Design, 2.39 Research, 2.44 Content and 4.45 Design engineering: **15.53 full-time equivalents per weekly baseline**. The fixture provides discipline-level demand, not named-person project bookings.

| Discipline | Available FTE-weeks | Committed demand | With proposed | Committed period utilization | With proposed |
|---|---:|---:|---:|---:|---:|
| Design | 87.50 | 42.48 | 45.20 | 48.55% | 51.66% |
| Research | 33.46 | 26.78 | 29.50 | 80.04% | 88.16% |
| Content | 34.16 | 22.30 | 23.66 | 65.28% | 69.26% |
| Design engineering | 62.30 | 41.52 | 43.56 | 66.65% | 69.92% |

Totals: committed demand **133.08 FTE-weeks**, with proposal **141.92 FTE-weeks**, available **217.42 FTE-weeks**. A below-capacity period average does not establish that work fits in every week.

| Discipline | Committed peak FTE / week(s) | With-proposal peak FTE / week(s) | Weeks above capacity, before → after |
|---|---|---|---|
| Design | 5.20 / 2026-11-02 | 5.20 / 2026-11-02 | 0 → 0 |
| Research | 3.30 / 2026-11-02 | 3.40 / 2026-11-16 | 7 → 8 |
| Content | 2.60 / 2026-11-02 | 2.60 / 2026-11-02 | 3 → 3 |
| Design engineering | 4.80 / 2026-11-02, 2026-11-09 | 4.80 / 2026-11-02, 2026-11-09 | 2 → 3 |

The actionable change is additional pressure on **Research and Design engineering**, not a new Design shortage. Research is already over capacity in seven weeks (October 12–November 23). The proposal extends that to the week of November 30 and raises the peak to 3.4 / 2.39 = **142.26%** in the week of November 16. Design engineering gains an additional over-capacity week on November 16: 4.7 / 4.45 = **105.62%**.

Capacity assumptions and limits:

- The quarter contains 66 weekdays, but its 14 displayed Monday-start weeks retain 70 equivalent capacity weekdays under the documented rule. First week starts September 28; last starts December 28. Demand is clipped to the quarter; supply is not. These expected figures intentionally follow that stated contract and should not be presented as exact calendar-quarter availability.
- `statements` remains committed and contributes 0.84 FTE-weeks despite delivery being completed. Delivery health/status does not remove planning commitment in the documented model.
- No holidays, leave, skills, assignment conflicts, expense, actual time, or named-person capacity distribution are provided. The result supports discipline-level scenario discussion; it cannot identify the person to reassign or establish that a particular leader’s team can absorb the work.
- Thresholds are ≤80% green, >80% through 100% amber, >100% red. Committed Research’s 80.0359% period average can round to “80%” while remaining above the 80% threshold.

### Exact weekly demand

Each cell is committed → committed plus proposed, in FTE. Available weekly capacity is constant as stated above.

| Week starting | Design | Research | Content | Design engineering |
|---|---:|---:|---:|---:|
| 2026-09-28 | 1.08 → 1.08 | 0.48 → 0.48 | 0.60 → 0.60 | 0.72 → 0.72 |
| 2026-10-05 | 3.30 → 3.30 | 1.80 → 1.80 | 1.90 → 1.90 | 2.40 → 2.40 |
| 2026-10-12 | 4.00 → 4.00 | 2.50 → 2.50 | 2.10 → 2.10 | 2.90 → 2.90 |
| 2026-10-19 | 4.70 → 4.70 | 2.70 → 2.70 | 2.30 → 2.30 | 3.50 → 3.50 |
| 2026-10-26 | 5.00 → 5.00 | 2.90 → 2.90 | 2.50 → 2.50 | 4.10 → 4.10 |
| 2026-11-02 | 5.20 → 5.20 | 3.30 → 3.30 | 2.60 → 2.60 | 4.80 → 4.80 |
| 2026-11-09 | 4.70 → 4.70 | 3.10 → 3.10 | 2.50 → 2.50 | 4.80 → 4.80 |
| 2026-11-16 | 4.30 → 4.70 | 3.00 → 3.40 | 2.20 → 2.40 | 4.40 → 4.70 |
| 2026-11-23 | 3.30 → 3.70 | 2.50 → 2.90 | 1.80 → 2.00 | 3.90 → 4.20 |
| 2026-11-30 | 3.10 → 3.50 | 2.00 → 2.40 | 1.70 → 1.90 | 3.70 → 4.00 |
| 2026-12-07 | 2.30 → 2.70 | 1.60 → 2.00 | 1.40 → 1.60 | 3.40 → 3.70 |
| 2026-12-14 | 1.50 → 1.90 | 0.90 → 1.30 | 0.70 → 0.90 | 2.90 → 3.20 |
| 2026-12-21 | 0.00 → 0.40 | 0.00 → 0.40 | 0.00 → 0.20 | 0.00 → 0.30 |
| 2026-12-28 | 0.00 → 0.32 | 0.00 → 0.32 | 0.00 → 0.16 | 0.00 → 0.24 |

## Use in the evaluation

Compare browser/map/grid/detail/export results against these precomputed sets and values. A UI that can only reveal a value after reverse-engineering it may be mathematically correct yet only partially useful. This file makes no pass/fail claim about browser behavior and proposes no product changes.

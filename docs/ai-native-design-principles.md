# Periscope: AI-native design direction

Captured from the user's supplied Anthropic Design lessons. These notes are inspiration, not independently verified quotations, a reconstruction of Anthropic's roadmap process, or evidence for its business performance. The principles below are our interpretation for Periscope. Proposed AI experiences are not implemented capabilities.

## Product intent

Help design leaders and UXD Operations understand their organization, explore choices and produce a plan they can act on. People set priorities, values and constraints. Software makes relationships, evidence and consequences easier to inspect. Any AI assistance should produce useful, reviewable work while preserving human judgment.

Keep the Work map as a way into the organization. Make the transition from seeing a problem to exploring a response short and clear.

## Principles applied to Periscope

| Principle | Product implication | Example and acceptance signal |
| --- | --- | --- |
| Open useful access to capability | Start with a real leadership task, then choose the smallest interaction that helps. A chat interface is optional. | Selecting an overloaded team exposes the projects causing pressure and offers a staffing scenario. The leader can trace the result to records and assumptions. |
| Prototype to discover | Use working prototypes to test uncertain ideas before expanding the roadmap. Internal interest is a signal, not proof of user value. | Trial a scenario panel with UXD Operations. Observe whether it changes an actual staffing decision; validate with representative users before promoting it. |
| Produce artifacts people can work with | Put the work beside its context: a scenario, decision brief, allocation grid or review snapshot. Keep it editable and exportable. | From a selected map branch, draft a review brief in the adjacent panel. Preserve the selection and period; expose contributing records and editable assumptions. |
| Let humans direct | Capture goals, constraints and tradeoffs explicitly. Show alternatives with consequences rather than presenting one opaque answer. | “Protect research capacity, keep this launch date, and avoid overtime.” Present feasible options and unresolved conflicts. A suggested plan remains a draft until applied. |
| Curate attention | Prioritize exceptions, changes and decisions. Reveal supporting detail on demand. Personalize the view without changing the meaning of shared data. | Head of Design sees the review summary; a VP sees their group; Operations sees staffing and update queues. Avoid adding one dashboard card per new feature. |
| Preserve curiosity and judgment | Offer an optional hypothesis before analysis. Do not impose a quiz or block straightforward actions. | “What do you expect is causing this delay?” lets a reviewer note a hypothesis, then compare it with evidence. Skipping is always possible; disagreement remains visible. |

## A candidate experience

1. **Notice:** Operations opens a staffing exception with its period, freshness and affected work.
2. **Frame:** They choose the outcome and constraints, optionally recording their own hypothesis.
3. **Explore:** Periscope shows a draft staffing scenario beside the selected work, including unmet demand and tradeoffs.
4. **Inspect:** The reviewer can inspect records, assumptions, unavailable information and the proposed differences from the baseline.
5. **Decide:** They edit, discard, export or explicitly apply the proposal. Applying uses existing validation and conflict checks.
6. **Learn:** A later review compares the decision with observed results. Acceptance of a suggestion alone is not evidence that it was effective.

This is a proposed interaction, not a claim that scenario generation, agent execution or outcome tracking exists today.

## Experiments to add after the data foundations

| ID | Candidate | Dependency | Evidence needed before expanding |
| --- | --- | --- | --- |
| AI-01 | Contextual review brief beside the map | OPS-01 dated updates and reliable source relationships | Users can verify important claims, identify missing/stale records, edit the brief and use it in a review. Measure preparation effort and correction burden against the current workflow. |
| AI-02 | Constraint-led staffing scenario | OPS-02/03/04 allocations, availability and reconciliation; OPS-11 scenario storage for a durable version | Constraints are satisfied or conflicts are explicit; every proposed change can be inspected. No invented availability or automatic reassignment. Deterministic calculations validate any generated proposal. |
| AI-03 | Saved task-specific views | OPS-05 overview and tested scope/filter behavior; ENT-03 before shared protected use | Different users reach their own decisions with fewer irrelevant items, while totals and access rules remain consistent. Start with configurable views before considering generated interfaces. |
| AI-04 | Optional hypothesis and evidence comparison | Reliable evidence and a clear task where reflection adds value | Representative users find it useful without slowing routine work. Do not grade people, infer performance or turn the feature into employee surveillance. |

Begin with a small fictional-data prototype of one task. Record the user problem, current baseline, observed benefit, failure cases and a stop/continue decision. Preserve useful manual workflows if the prototype does not improve them. Internal adoption, novelty and generation speed are insufficient success criteria on their own.

## Delivery boundaries

- Keep the local Next.js/SQLite architecture, stable IDs, reviewed imports and session-only fictional example. These principles do not require a graph database or a new AI framework.
- Implement trustworthy updates, allocation and availability before claiming reliable staffing recommendations. A model cannot supply missing enterprise facts.
- Distinguish recorded facts, calculated results and generated suggestions. Source links, dates, missing inputs and assumptions must be inspectable.
- Preserve the current plan until an explicit apply action; show what will change and support cancellation. Use revision checks and atomic persistence. Design undo/history before promising reversibility after application.
- A local prototype should use fictional data. Sending enterprise records to a model requires an approved provider, data-handling rules and source access. Do not add live connectors, recurring agents or external messages implicitly.
- Keep concise software labels, Fidelity Sans, green rounded actions, persistent navigation/header and Work map interaction continuity. A thinner interface must still be keyboard accessible and understandable.
- Test with actual design leaders and Operations staff. AI-assisted walkthroughs can find defects but do not establish human usability or business impact.

## Relationship to the implementation backlog

Use these principles to shape how backlog items are delivered, not to replace the operational foundations or start all AI experiments. See [UXD Operations backlog](uxd-operations-backlog.md), [leadership experience](leadership-experience.md), [enterprise architecture](enterprise-architecture.md) and [current import contract](enterprise-data-mapping.md).

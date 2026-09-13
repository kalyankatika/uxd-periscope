# Periscope enterprise product assessment

## Recommendation

Develop Periscope as a **UXD leadership workspace**: a view of priorities, projects, people, capacity and related financials, assembled from existing systems with governed manual planning. Focus on ELT, the head of UXD, VP/design leaders and UXD operations. Keep interfaces extensible for later uses; a second business function is not a current delivery requirement.

The product should answer five questions reliably:

1. What are we working on, and why does it matter?
2. Who owns it, who contributes, and which leaders are accountable?
3. What capacity and money are committed, forecast and actually used?
4. What changed, what needs a decision, and how current is the evidence?
5. Can I inspect the underlying records without seeing information I am not permitted to access?

The market already contains substantial strategic portfolio management, collaborative work management, resource planning and analytics products. A connected graph is useful, but is not a defensible differentiation by itself: Planview explicitly offers a Connected Work Graph.[^planview] Periscope's opportunity is a **testable product hypothesis**: leaders can make cross-system portfolio decisions with less interpretation and administration, while retaining the identity, source, date and permission context behind every result.

Keep the current local Next.js/SQLite implementation as the pilot. For enterprise use, separate the presentation, application/API, ingestion and persistence responsibilities. A static frontend is a possible deployment option; a static-only application does not meet shared editing, durable synchronization, history and authorization requirements. The [architecture decision](enterprise-architecture.md) explains the choices.

## Scope and evidence

Research checked **12 September 2026**. Sources are official vendor documentation, product pages, standards and the current repository. Vendor documentation establishes advertised capabilities and interface contracts; it does not independently establish usability, implementation effort, customer outcomes or fitness for this enterprise. No competitor tenant, customer interview, procurement quote, live source integration or production security assessment was performed. Product and architecture recommendations below are analysis, not shipped capabilities.

**Scope clarification:** the user confirmed UXD as the current focus after this research. Portfolio-manager use cases are background possibilities, not target users or acceptance criteria for the current build. The wider market comparison informs UXD product decisions; cross-domain presets and investment-portfolio capabilities are deferred.

The analysis covers product positioning, users, competitors and substitutes, end-to-end capabilities, data semantics, automation, security, adoption and delivery gates. It does not assert a market size or promise that a particular buyer will adopt the tool.

## Users and decisions

| User | Decision or job | Required view | Evidence needed |
| --- | --- | --- | --- |
| ELT / executive sponsor | Continue, stop, defer or fund priorities | Portfolio outcomes, changes, exceptions and investment summary | Priority owner, approved budget, delivery confidence, source dates |
| Head of design / function head | Understand the whole group and resolve competing work | Priorities by leader, shared projects, demand and available capacity | Deduplicated project ownership and contribution, reporting hierarchy |
| VP / design leader | Review reports' projects and unblock delivery | Leader → teams → people → projects; accountable and contributing work | Formal reporting, project roles, dependencies, decisions needed |
| UXD operations / planning lead | Compare UXD initiatives and sequence team commitments | Comparable project grid, priorities, scenarios and decisions | Common status definitions, planning periods, resource assumptions |
| Project owner | Keep delivery facts current and request help | Own projects, updates, milestones and unresolved mappings | Source-owned fields versus editable planning fields |
| Finance partner | Reconcile budgets, commitments, forecasts and actuals | Financial view with controlled drill-down | Ledger references, approved rates, currency and accounting periods |
| People / resource manager | Plan staffing without overstating availability | Capacity by skill, team, time and approved assignment | Effective-dated employment, calendars, allocations and leave policy |
| Data steward / integration owner | Maintain reliable mappings and access | Source runs, rejected records, taxonomy and identity review | Immutable IDs, mapping versions, scope, permission and freshness checks |
| Platform / security owner | Operate and govern the service | Deployment, access, audit and recovery controls | Ownership, data classification, threat model and operational evidence |

Leadership usability must be tested with leaders. Design the default screen around decisions and exceptions, with drill-down to evidence; expose integration settings to stewards instead of adding technical labels to executive views.

## Market landscape

These categories overlap. This is a capability comparison, not a ranking or a claim of feature parity. Availability can depend on edition, add-ons, deployment and contract; obtain tenant-specific demonstrations and quotes.

| Product / category | Documented emphasis | Implication for Periscope and evaluation question |
| --- | --- | --- |
| **Atlassian Strategy Collection** — strategic planning | Focus, Talent and Align connect strategic priorities, workforce planning and execution.[^atlassian] | Strong incumbent where Jira/Align are established. Can the existing collection deliver the leadership workflow and non-Atlassian source coverage with acceptable setup? |
| **Planview** — strategic portfolio management | Strategy, investment planning, resource scenarios, financial planning and a connected work graph.[^planview] | Direct overlap across most of the proposed scope. Test graph-to-financial reconciliation and cross-source governance before assuming a gap. |
| **ServiceNow SPM** — enterprise portfolio management | Strategic planning, demand, project portfolios and resource management within its platform.[^servicenow] | Consider extending an existing ServiceNow estate. Evaluate coverage of delivery and hierarchy sources, leadership usability and operating ownership. |
| **IBM Targetprocess** — agile portfolio management | Links strategic planning, portfolio execution, resource planning and financial visibility.[^targetprocess] | Relevant when funding and agile execution must connect. Compare finance integration and portfolio hierarchy fit. |
| **Planisware** — portfolio and investment planning | Consolidates portfolio information including resources, schedules, actuals and financial baselines.[^planisware] | Relevant to formal planning and investment governance. Test how much of the desired workflow is configuration versus custom work. |
| **Asana Portfolios** — collaborative work management | Portfolio status, owners, custom fields, nested portfolios and workload visibility.[^asana] | Strong accessible-leadership alternative. Evaluate source authority, confidential financials and cross-system identity requirements with a real fixture. |
| **monday.com** — configurable work and resource management | Enterprise resource tools include a resource directory, planner, portfolio utilization and capacity management.[^monday] | Fast configuration may cover much of the need. Validate consistent data semantics and governance across independently configured boards. |
| **Smartsheet** — standardized portfolio operations | Portfolio intake, approvals, templates, provisioning, change control and reporting.[^smartsheet] | A credible spreadsheet-to-portfolio path. Compare ongoing template administration and the required relationship/history model. |
| **Adobe Workfront** — enterprise work management | Resource and portfolio management with integration options; availability varies by package.[^workfront] | Particularly relevant to design and creative operations. Evaluate workflow fit beyond creative production and actual-cost reconciliation. |
| **Productboard** — product strategy and roadmapping | Links objectives, initiatives and features with prioritization and roadmap views.[^productboard] | Relevant to product/design strategy. Determine whether workforce and financial needs require additional systems. |
| **Aha! Roadmaps** — planning and capacity | Individual/team capacity, effort estimates and planning scenarios.[^aha] | A useful comparator for prioritization and capacity interactions. Validate hierarchy and source-financial coverage separately. |
| **Orgvue** — organization and workforce planning | Organizational models, workforce costs, capacity and planning connected to HR/finance data.[^orgvue] | Strong comparator or complementary source for hierarchy and workforce scenarios. Evaluate project-delivery relationships explicitly. |
| **Existing BI + enterprise data platform** — build/extend substitute | Power BI documents semantic-model row-level and object-level security controls.[^powerbi] | A governed reporting layer may already satisfy much of the read-only requirement. Compare the extra work for reviewed edits, operational synchronization, graph interaction and decision workflows. |

The strongest competition may be an existing platform plus a well-designed dashboard, rather than a new standalone product. Also compare today's spreadsheets, recurring status meetings and manually reconciled presentations: they establish the baseline cost and adoption burden.

### Positioning and differentiation to validate

Position Periscope as the **UXD leadership decision workspace over enterprise work systems**. Jira can remain the delivery system; a directory remains the people authority; finance remains the actual-cost authority. Locally created planning records fill gaps with visible ownership.

Candidate advantages are:

- A single decision flow from executive snapshot to leader, project, allocation and source record, retaining selection between map and grid.
- Field-level source and effective-date visibility, including unknown, stale and conflicting values.
- Reliable identity reconciliation and explicit shared-project attribution across organizational boundaries.
- Reviewed manual planning that survives source refresh without silently replacing authoritative facts.
- Enterprise-controlled deployment and a small, documented integration contract.

These are hypotheses, not unique capabilities. Validate them against configured incumbents using the same dataset and tasks. Avoid positioning as another task manager, an automatic employee-performance scorer, or a universal replacement for portfolio, HR and finance platforms.

### Build, buy or extend

Use a scored proof of concept after confirming what the enterprise already licenses. Suggested evaluation weights are integration/identity **25%**, leadership decisions/usability **20%**, security/governance **20%**, time/financial reconciliation **15%**, deployment/ownership **10%**, and total operating cost/support **10%**. These are proposed buyer weights, not measured scores. Apply mandatory security and data-rights gates before scoring.

Compare three concrete alternatives: configure an incumbent; build a thin experience over the existing enterprise data platform; develop Periscope's own canonical model and ingestion service. The last option is justified only if unmet workflows and ownership benefits exceed its continuing product, connector and security maintenance cost.

Do not estimate total addressable market by adding overlapping SPM, work-management, BI and workforce market reports. A defensible later estimate needs eligible organizations, buyer budget, reachable distribution and willingness-to-pay evidence. No defensible revenue forecast or pricing recommendation follows from public feature pages alone.

For internal value, measure reporting preparation, reconciliation, decision latency and avoidable duplicate work. An illustrative calculation—**not a forecast**—is 20 leaders × 1.5 hours saved weekly × 46 weeks × $80 loaded hourly cost = **$110,400 of annual capacity value**. That is not automatically cash savings. Validate adoption and realized time savings, then subtract implementation, integration, infrastructure, support, security and migration costs. Do not also count the same hours as separate productivity benefits.

## End-to-end product coverage

### Operating cycle

1. **Configure the workspace:** choose domain labels, portfolios, fiscal calendar, currencies, roles, status mappings and source owners.
2. **Connect or import:** select an authorized source scope or upload a versioned file; keep extraction separate from publication.
3. **Review mappings:** resolve IDs, hierarchy levels, taxonomies, permissions and field ownership; preview changes and rejected records.
4. **Publish a coherent view:** show source coverage and last successful refresh; preserve the previous accepted view when ingestion fails.
5. **Create and plan:** allow manual initiatives, owners, priorities, allocations and assumptions within permissions.
6. **Prioritize and fund:** compare outcomes, demand, dependencies, budget and scenarios; record the approving decision and baseline.
7. **Track delivery and usage:** ingest updates, approved time and financial actuals; preserve accounting and effective dates.
8. **Review exceptions:** surface missing owners, stale evidence, dependency conflicts, capacity pressure and financial variance with explanations.
9. **Decide and follow through:** record decisions, accountable owners and review dates; future writeback is a separate authorized workflow.
10. **Close and learn:** reconcile final actuals, outcomes and lessons; archive records under retention policy without breaking history.

### Current coverage versus required product

“Implemented” below means supported by repository code and existing local verification. “Partial” identifies a narrower implemented behavior. “Proposed” means no working capability should be inferred.

| Capability | Current state | Required enterprise completion evidence |
| --- | --- | --- |
| Executive overview and leader drill-down | **Implemented, local UXD scope** — overview, reporting tree and deduplicated leader project rollups | Leadership task tests; source-aware totals and access filtering |
| Work map and grid | **Implemented** — linked selection, filters, relationship focus and exports | Keyboard/accessibility review; permission-safe graph, counts and exports at agreed scale |
| Project comparison and delivery health | **Implemented** — project grid, filters and explicit reported health | Configurable taxonomies; separate reported health from calculated risk |
| People/project CSV review | **Implemented** — single-file and combined imports, mapping review, ID/reference validation | Extend to versioned enterprise entity schemas and source provenance |
| Manual project/person editing | **Implemented, local workspace** | Per-record authorization, audit, ownership and concurrent-edit handling |
| Persistence and stale-save protection | **Implemented** — SQLite and whole-plan revision | Shared-service concurrency, migration/recovery evidence and granular updates |
| UXD discipline and work-type configuration | **Partial** — four crafts fixed in the schema; teams and disciplines are separate concepts | Approved UXD mappings cover the group's work without weakening ID or taxonomy validation |
| Formal organizational history | **Partial** — current manager IDs and reporting-cycle validation | Effective-dated membership, reorganization history and approved directory source |
| Teams and priorities as stable entities | **Partial** — labels currently serve as identity | Immutable IDs, aliases and rename-safe relationships |
| Individual assignment and role | **Partial** — owner/contributor relationships | Allocation by person, role and period; membership must not imply assigned effort |
| Capacity planning | **Partial** — weekly demand and available capacity by craft | Configurable units, calendars, leave and individual/team assignment rules |
| Portfolio/objective hierarchy | **Partial** — business priority labels and project dependencies | Portfolio IDs, typed work levels, objectives/outcomes and validated rollups |
| JSON integration | **Partial** — internal plan GET/PUT and graph JSON-LD export | Public versioned ingestion schema, reviewed JSON upload, scoped bulk API and compatibility tests |
| Jira / Align / trackIT connectors | **Proposed** | Authorized source fixtures, adapter tests, reconciliation and operational ownership |
| SSO and directory integration | **Proposed** | Login, immutable subject crosswalk, separate directory authorization and revocation tests |
| Scheduled/event-driven synchronization | **Proposed** | Durable jobs, deduplication, checkpoint recovery, freshness and failure handling |
| Approved actual time | **Proposed** | Time-entry identity, units, work dates, approvals, reversals and source reconciliation |
| Expenses, budgets, forecast and actual costs | **Proposed** | Currency, accounting periods, transaction lineage, rates and controlled financial access |
| Field-level lineage and manual overrides | **Proposed** | Original value, effective value, source, mapping version, author and reason |
| History and audit | **Proposed** — a current plan revision is not an audit log | Append-only change/decision records, as-of queries and retention behavior |
| Access controls and enterprise isolation | **Proposed** | Server-side record/field policy across API, graph, grid, counts, search and export |
| Intake, approval and decision workflow | **Proposed** | Accountable approvers, state transitions, evidence, notifications if enabled and history |
| Outcomes and benefits realization | **Proposed** | Baselines, measurement source, benefit owner and review periods |
| AI assistance | **Proposed** | Source-cited, permission-filtered assistance with tested factuality and human decision control |

Code anchors: [domain](../lib/domain.ts), [persistence](../lib/db.ts), [import preview](../lib/import-preview.ts), [graph](../lib/work-graph.ts), [leadership](../app/leadership.tsx), [plan API](../app/api/plan/route.ts). The [build audit](enterprise-build-audit.md) provides the implementation and portability evidence.

## UXD data model and integration boundaries

The core should be typed and support the UXD group's work across Product Design, Research, Content, Design Systems, Design Strategy, Innovation and UX AI. Agree which concepts are teams, disciplines, work types or priorities instead of treating the labels as interchangeable. Keep source adapters and identity/accounting rules independent of display labels so later extensions remain possible. Additional business-domain presets are deferred. Arbitrary JSON should be allowed only in documented, namespaced extensions, not as a substitute for an explicit core model.

| Entity group | Proposed core records and relationships |
| --- | --- |
| Structure | Workspace, portfolio, organizational unit, team, person, role; effective-dated membership and reporting edges |
| Strategy and work | Objective/outcome, priority, typed work item, milestone, dependency, owner and contributor; explicit parent/child relationships |
| Planning | Planning period, calendar, capacity, assignment/allocation, scenario and approved baseline |
| Usage and finance | Time entry, expense/ledger entry, commitment, budget, forecast, rate and currency conversion reference |
| Governance | Decision, approval, source system, external record reference, mapping version, ingestion run, manual override, policy and audit event |

Use internal immutable IDs plus unique external references containing source instance, entity type and source ID. Preserve aliases for discovery, but never merge people or projects by name. Model legal entity, cost center and portfolio as separate concepts. A leader's reporting tree is not automatically a permission tree. Historical results must use an explicit historical organizational basis rather than silently reassigning past work after a reorganization.

A relational database can represent these relationships and provide graph projections. Introduce a dedicated graph database only after measured query requirements justify the additional operations, synchronization and policy complexity.

### Metric definitions that must be visible

- **Participation:** a person being named on a project establishes a relationship, not hours or percentage allocation.
- **Planned load:** sum approved assignment effort for the selected period. Compare with capacity using the same calendar and units. Current craft-level demand cannot be treated as individual utilization.
- **Actual time:** use approved time records and adjustments. Ticket activity, story points and issue counts do not establish hours worked.
- **Financials:** show budget, committed spend, forecast and posted actual separately. Adding all four together is invalid. Labor estimates need an approved rate basis; never infer salary from title.
- **Currency:** retain original currency and amount. A reporting-currency total needs a named conversion source, effective date and rounding policy; mixed currencies cannot simply be summed.
- **Shared work:** group totals count a project once. Leader lists can show the same shared project under multiple leaders, clearly distinguishing accountable from contributing work. Summing those lists will double-count unless a declared allocation rule is applied.
- **Variance:** compare values with matching scope, unit, period and baseline. State whether forecast is total at completion or remaining effort/cost.
- **Confidence and freshness:** missing, stale and zero are different states. Report coverage alongside totals; do not turn missing health or financial data green.
- **Outcomes:** an initiative marked complete does not prove its intended benefit occurred. Keep outcome measures, baseline and attribution separate.

## Interaction model

Preserve the current Work map interaction and provide a grid alternative for comparison, keyboard use and dense data. The map should explain selected relationships; avoid rendering every enterprise record at once. Search, filters, bounded neighborhoods and progressive expansion should carry the same selection into detail views.

Proposed primary destinations are **Overview**, **Portfolios**, **Work map**, **People & capacity**, **Financials**, and **Decisions**. Source and mapping administration belongs in **Data & settings**. These are future information-architecture recommendations; this assessment does not rename current navigation.

The executive Overview should show top priorities, changes since the last review, decisions required, leader summaries and data freshness. Selecting a leader shows accountable and contributing projects, reports and resource issues. Selecting a project shows outcome, owner, collaborators, dates, dependencies, funding and source evidence. Every number should explain its scope and offer a permitted drill-down.

Use concise software labels and retain the established Fidelity Sans, green actions and rounded buttons for the current pilot. Enterprise theming should later be configurable. Target WCAG 2.2 AA with keyboard navigation, clear focus, non-color status cues and a table/grid alternative; current conformance has not been audited.[^wcag]

## Automated and manual tracking

Automation should update accepted facts; people should own decisions and planning assumptions. Start with read-only source connectors and manual annotations. Source writeback is a later, separately governed capability.

Directory identity and formal reporting come from the agreed directory; delivery status comes from the designated work system; approved actual time comes from the time authority; financial actuals come from the approved finance source. Priorities, delivery-health assessments and forecast allocations can be locally owned where the business explicitly chooses that arrangement.

Store imported values, overrides and derived values separately. A manual override needs an owner, reason, effective dates and expiry/review rule. Source refresh must retain the new source fact and flag a conflict rather than erase the edit or suppress the source indefinitely. A manually created project gets a local immutable ID; linking it to a later source record is an explicit reviewed operation.

The [connector assessment](enterprise-connectors.md) documents Jira Cloud, Data Center and Align separately, OIDC versus directory data, proposed JSON envelopes, retries, tombstones, permission propagation and mapping requirements. Internal trackIT and whoswho remain unspecified until their owners provide actual contracts. The current application does not implement these connectors or a generic JSON upload.

## Trust, security and operations

SSO authenticates a user; it does not authorize every project or financial record. Enforce record and field access on the server and in derived outputs. OWASP identifies missing object-level authorization as a major API risk.[^owasp-auth] Hidden nodes must not leak through edge labels, aggregate counts, search suggestions, exports or cached responses. Cost rates and employee-sensitive details may require stricter access than project metadata.

Initial enterprise gates should include a data owner, classification and retention policy; a threat model; approved identity/role mapping; secrets stored outside the browser; source permission reconciliation; audit and backup/restore evidence; and an operating owner. Connector endpoint configuration needs approved destinations and network controls, because server-side requests to user-supplied URLs create SSRF risk.[^owasp-ssrf] Internal enterprise endpoints can be legitimate; they must be explicitly authorized rather than universally blocked or universally trusted.

Track content freshness and permission freshness separately. Define what happens when source access expires or is revoked, when a run is incomplete, or when a source changes schema. Keep source health visible and avoid presenting partially synchronized information as a complete current portfolio.

AI assistance should follow trusted data foundations. Useful initial functions are explaining a portfolio change, drafting a cited review and suggesting mapping candidates for approval. Treat descriptions and source text as untrusted data; enforce the user's access before retrieval. Do not authorize spending, alter staffing, write to source systems or rate individuals solely from generated output. Evaluate citation correctness and unsupported claims before enabling an assistant.

## Delivery sequence and acceptance gates

This sequence describes future product work, not a promise that analysis has implemented it. Dates and cost estimates require source contracts, staffing and deployment constraints.

| Phase | Deliverable | Exit gate |
| --- | --- | --- |
| **0 — Repository baseline** | Current local pilot, reproducible verification, research, integration contract and enterprise gap register | Clean install/test/build/start evidence; no saved data or credentials included in verification |
| **1 — UXD data foundation** | Stable team/priority IDs, agreed UXD discipline/work-type mappings, versioned JSON schema, staging/review, lineage and safe migration | Existing UXD workspace preserved; leader/project/allocation relationships reconcile across views; invalid batch leaves state unchanged; source replay is idempotent |
| **2 — First governed integration** | Approved identity/access boundary plus one read-only Jira deployment and directory source | Authorized end-to-end fixture reconciles; permission revocation applies to all views; failures show stale coverage; manual planning survives refresh |
| **3 — Portfolio, time and financial depth** | Align hierarchy, actual trackIT/finance adapter, accounting definitions, baselines and historical reporting | Totals tie to signed-off source fixtures; currency and reversals pass; no mirrored cost double-counting; historical organization basis is explicit |
| **4 — Decisions and scale** | Intake/approvals, decision history, scenarios, optional source writeback and evidence-based AI | Workflow permissions, recovery, scale and usability targets pass; outbound changes have explicit policy and audit |

The next bounded implementation is **Phase 1: UXD data foundations and reviewed JSON ingestion**, retaining the existing CSV workflow and local database. Evaluate it through UXD leadership tasks, including priority → leader → reports/projects → allocation drill-down. Enterprise SSO and record-level authorization must be in place before shared sensitive-data use, even if connector development begins earlier with fictional fixtures. A migration to a managed database is a deployment decision, not a prerequisite for improving the UXD model locally.

### Proposed pilot acceptance

Use fictional fixtures first, then an approved, limited enterprise scope. These are targets, not achieved results:

- Four of five representative leaders complete “find our top priorities, select a leader, identify the owner and inspect the source” without assistance in under two minutes. Revise the threshold after baseline testing.
- Every displayed financial total and imported decision-critical field exposes its source/basis, observation date and coverage. No rejected mapping is silently accepted.
- Overview, leader drill-down, map, grid and export reconcile for the same scope, including shared projects and hidden records.
- Identity rename, reorganization, duplicate delivery, incomplete pagination, replay, source deletion, schema drift and permission loss have tested outcomes.
- Approved time and financial fixtures reconcile exactly under agreed units, rounding, currency and reversal rules.
- Simultaneous edits detect conflicts; accepted imports are recoverable; a restart resumes from a valid checkpoint.
- A backup restores into a clean environment and passes agreed record-count, relationship and permission checks.
- Accessibility testing covers keyboard paths and a usable alternative to the graph. Performance targets are set against the enterprise's real user count, records, refresh interval and network profile before load testing.

Measure preparation time, reconciliation effort, decision turnaround, data freshness, adoption and unresolved mappings before and during the pilot. Do not use raw login counts as proof that decisions improved.

## Handoff and unresolved decisions

The repository is a working **local pilot**, not an enterprise production release. This assessment adds research and build reproducibility; connector automation, generic data migrations, expenses and enterprise access controls remain proposed. See the [handoff guide](enterprise-handoff.md) for current verification and release boundaries.

Before live integration, obtain source owners and versioned specifications; anonymized UXD fixtures; identity crosswalks; field authority; permitted scopes; financial definitions; volumes/freshness targets; deployment and support ownership; and retention requirements. Portfolio-manager use cases require a separate future brief and do not block UXD delivery.

The bundled Fidelity fonts require a rights review: their embedded notices contain restrictions, and this repository does not establish a redistribution grant. Preserve the requested pilot typography while the enterprise owner verifies permission or chooses an approved replacement. The repository also has no root license file; sharing/importing rights and intended licensing should be explicitly settled rather than invented by this assessment.

## Sources

All sources below were checked on **2026-09-12**. Product pages without a stable publication date are treated as undated current vendor descriptions. API versions and enterprise configuration must be rechecked during implementation. Technical integration references are also collected in [enterprise-connectors.md](enterprise-connectors.md); architecture references are in [enterprise-architecture.md](enterprise-architecture.md).

[^atlassian]: Atlassian, [Strategy Collection](https://www.atlassian.com/collections/strategy). Official product description; not a procurement quote or independent performance study.
[^planview]: Planview, [Strategic Portfolio Management](https://www.planview.com/products-solutions/solutions/strategic-portfolio-management/). Official capability description, including the Connected Work Graph.
[^servicenow]: ServiceNow, [Strategic Portfolio Management](https://www.servicenow.com/products/strategic-portfolio-management.html). Official platform and capability description.
[^targetprocess]: IBM / Apptio, [Targetprocess](https://www.apptio.com/products/targetprocess/). Official product capabilities.
[^planisware]: Planisware, [How Planisware creates a single source of truth](https://planisware.com/resources/planisware-hub/how-planisware-creates-single-source-truth). Vendor-authored explanation, not comparative evidence.
[^asana]: Asana, [Portfolios](https://asana.com/features/goals-reporting/portfolios). Official feature and availability description.
[^monday]: monday.com Support, [Resource management for Enterprise](https://support.monday.com/hc/en-us/articles/24114492777618-Resource-management-for-Enterprise). Official resource-tool documentation.
[^smartsheet]: Smartsheet, [Portfolio management](https://www.smartsheet.com/platform/portfolio-management). Official capability description.
[^workfront]: Adobe, [Workfront packages](https://business.adobe.com/products/workfront/pricing.html). Official package/capability comparison; no numerical price assumed.
[^productboard]: Productboard, [Product strategy](https://www.productboard.com/use-cases/product-strategy/). Official strategy and planning description.
[^aha]: Aha!, [Roadmaps capacity planning](https://www.aha.io/roadmaps/capacity). Official feature description.
[^orgvue]: Orgvue, [Workforce planning software](https://www.orgvue.com/solutions/strategic-workforce-planning/workforce-planning-software/). Official workforce and organization-planning description.
[^powerbi]: Microsoft Learn, [Power BI security white paper](https://learn.microsoft.com/en-us/power-bi/guidance/white-paper-powerbi-security). Official architecture and semantic-model security guidance.
[^wcag]: W3C, [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/). Normative accessibility standard; inclusion here does not certify conformance.
[^owasp-auth]: OWASP, [API1:2023 — Broken Object Level Authorization](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/). API security guidance.
[^owasp-ssrf]: OWASP, [API7:2023 — Server Side Request Forgery](https://api-security.owasp.org/editions/2023/en/0xa7-server-side-request-forgery/). API security guidance.

# Enterprise connectors

Research checked **12 September 2026**. This document separates verified upstream API behavior from a proposed Periscope integration design. It does not mean these connectors, authentication, financial models, or synchronization are implemented. The current local Next.js/SQLite application and its saved workspace remain the supported architecture; [enterprise data mapping](enterprise-data-mapping.md) defines the implemented import behavior.

## Integration boundary

Periscope should provide a governed view across systems, with links back to the records that explain each result. Jira can supply delivery evidence, a planning system can supply strategic alignment, and a directory can supply reporting relationships. A connector must not assume that similarly named entities are identical or that one system owns every field.

| Source | Proposed contribution | Mapping decisions before connection |
| --- | --- | --- |
| Jira Cloud or Data Center | Issues, projects, owners, delivery states, dates, dependencies; worklogs where authorized | Deployment/version, project scope, work-item level, status/priority dictionaries, authoritative identity crosswalk |
| Jira Align | Portfolio/program hierarchy, objectives, epics, capabilities, features, teams, planning periods | Which hierarchy levels represent Periscope projects; links to Jira records; approved custom-field definitions |
| trackIT | Time entries, project codes and potentially approved cost inputs | Actual system owner, API/export specification, units, approval/reversal semantics, finance authority |
| whoswho / hierarchy chart | People, managers, organization units, effective dates | Actual system/API, immutable IDs, active/terminated records, dotted-line versus formal reporting |
| SSO user-info APIs | Authenticated user's identity and permitted claims | Issuer, audience, subject-to-person mapping, session policy; directory access is a separate grant |
| JSON, CSV, manual entry | Initial onboarding, missing project records, planning assumptions and corrections | Versioned schema, source ownership, review/approval, interaction with later automated updates |

**trackIT and whoswho are unspecified source names supplied by the user.** They may be internal services. No vendor, endpoint, authentication scheme, available field, or data-access right has been established. Obtain their actual specifications and anonymized fixtures before estimating an adapter.

## Verified upstream requirements

### Jira Cloud

Atlassian recommends OAuth 2.0 authorization-code grants (3LO) for integrations outside Forge/Connect. REST v3 uses Atlassian Document Format for rich-text fields; treat descriptions as structured content and render safely. Source permissions still apply. [Jira Cloud REST API introduction](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

Enhanced issue search is `/rest/api/3/search/jql`, with `nextPageToken`; the older `/rest/api/3/search` operations are marked as being removed. The enhanced search documentation recommends the classic `read:jira-work` scope and lists operation-specific granular alternatives. Browse-project and issue-security permissions determine which issues are returned. Search results may lag recent changes; `reconcileIssues` supports stronger read-after-write behavior. Do not reuse one endpoint's pagination or scope assumptions across the entire API. [Jira Cloud REST API — Issue search](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/)

Current rate-limit documentation distinguishes hourly points quotas, per-endpoint burst limits, and per-issue write limits. It also distinguishes API-token traffic from the newer app quotas. Handle HTTP 429 and `Retry-After`, with bounded backoff and jitter; capacity must be measured against the selected authentication model and tenant. [Jira Cloud — Rate limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/)

REST-registered webhooks expire after 30 days and require renewal. Renewal's documented classic scopes include `read:jira-work` and `manage:jira-webhook`; webhook operations are restricted to the supported app types. [Jira Cloud REST API — Webhooks](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-webhooks/)

Webhook retries can duplicate delivery; `X-Atlassian-Webhook-Identifier` is stable across retries within a tenant. Use durable deduplication and periodic reconciliation. Verify the authentication/signature mechanism for the selected registration method; a callback URL alone does not establish trust. [Jira Cloud — Webhooks](https://developer.atlassian.com/cloud/jira/platform/webhooks/)

### Jira Data Center

Treat Data Center as a separate adapter, with the installed version's API documentation and network requirements. Atlassian documents OAuth and user-permission-based API authorization; it separately documents personal access tokens. Cloud OAuth URLs, account identifiers, event behavior, and rate-limit rules are not a portable contract for Data Center. [Jira Data Center — Security overview](https://developer.atlassian.com/server/jira/platform/security-overview/), [Personal access token](https://developer.atlassian.com/server/jira/platform/personal-access-token/)

### Jira Align

Jira Align v2 uses `/rest/align/api/2/…`; detailed Swagger documentation is provided in each instance. Manual sign-in/SAML configurations support Jira Align API bearer tokens. Atlassian Guard authentication requires Atlassian API tokens; scoped read/write permissions and token lifecycles differ. API access follows the authenticated user's UI privileges. Current guidance documents a 600-requests-per-60-seconds limit per IP, followed by blocking when exceeded. Confirm the tenant configuration before selecting credentials or throughput. [Jira Align — Getting started with REST API 2.0](https://help.jiraalign.com/hc/en-us/articles/360045371954-Getting-started-with-the-REST-API-2-0)

Pagination/querying uses options including `$top`, `$skip`, `$select`, `$orderby`, and `$filter`; published GET guidance documents batches of at most 100. These are distinct from Jira Cloud's enhanced-search cursor. [API 2.0 query syntax](https://help.jiraalign.com/hc/en-us/articles/360060894632-API-2-0-query-syntax), [API 2.0 GET usage and filters](https://help.jiraalign.com/hc/en-us/articles/360048085774-API-2-0-GET-usage-and-filters)

Custom-field support depends on object type and active fields exposed in configuration. Work-item `/editmeta` supplies types, labels, required flags and allowed values. Preserve field/option IDs alongside labels and version their mapping; do not assume Jira and Jira Align custom fields are interchangeable. [API 2.0 custom field support](https://help.jiraalign.com/hc/en-us/articles/4415143457556-API-2-0-custom-field-support)

### Identity and reporting

OpenID Connect UserInfo describes the authenticated end user. Verify its `sub` exactly matches the ID token's `sub`; requested claims can be omitted. Use issuer plus subject as the external identity key. This does not grant an organization-wide roster or establish reporting relationships. [OpenID Connect Core 1.0, sections 2 and 5.3](https://openid.net/specs/openid-connect-core-1_0.html)

SCIM's enterprise extension defines organization, department, cost center and a manager reference to another user's ID. Its protocol supports identity provisioning and retrieval, but an enterprise must expose and authorize the required attributes; SSO availability alone does not imply SCIM availability. [RFC 7643 — Core Schema](https://www.rfc-editor.org/rfc/rfc7643.html), [RFC 7644 — Protocol](https://www.rfc-editor.org/rfc/rfc7644.html)

As one concrete directory example, Microsoft Graph documents `/users/{id}/manager`. At this review, its permission table lists delegated `User.Read.All` and marks application permissions unsupported for that operation. Do not promise unattended hierarchy extraction from a login token: confirm the chosen endpoint, cloud, consent model and tenant behavior. [Microsoft Graph v1.0 — List manager](https://learn.microsoft.com/en-us/graph/api/user-list-manager?view=graph-rest-1.0)

## Proposed adapter and JSON contract

Keep vendor transport outside the domain model. Each adapter should declare capabilities and implement credential checking, schema discovery, full extraction, incremental extraction where supported, and normalization. The shared ingestion service should validate, preview, commit, audit and reconcile. A connector with no delta API can use scheduled full comparisons; it must not advertise incremental synchronization.

The following is an **illustrative future envelope**, not an accepted upload format or a complete JSON Schema. It contains fictional identifiers. The existing plan API and import contract remain unchanged.

```json
{
  "schemaVersion": "1.0",
  "source": { "system": "jira-cloud", "instanceId": "fictional-site" },
  "batchId": "fictional-batch-001",
  "mode": "delta",
  "mappingVersion": "jira-work-v1",
  "extractedAt": "2026-09-12T14:00:00Z",
  "checkpoint": { "previous": "opaque-42", "next": "opaque-43" },
  "records": [{
    "entityType": "workItem",
    "sourceId": "10042",
    "operation": "upsert",
    "sourceUpdatedAt": "2026-09-12T13:50:00Z",
    "sourceAcl": { "policyRef": "fictional-policy-12" },
    "data": { "title": "Client onboarding", "sourceStatusId": "3" },
    "relationships": [{
      "type": "ownedBy",
      "target": { "system": "directory", "instanceId": "fictional-org", "id": "0007" }
    }]
  }]
}
```

Use `(system, instanceId, entityType, sourceId)` as a unique external reference to an immutable Periscope ID. Keep IDs as strings, including leading zeros. Approved crosswalks connect Jira account IDs, directory IDs and Align user IDs; names and email addresses are display/search attributes, not identity resolution. Model both a Jira issue and an Align feature when they represent different levels; aggregate through explicit relationships instead of deduplicating by title.

Version envelope, entity schema, connector, taxonomy and mapping independently. Define required fields, null-versus-omitted semantics, extension namespaces, payload limits and compatibility policy in a formal schema before implementation. A snapshot requires declared scope and complete-page evidence; a delta requires ordered checkpoint semantics. Persist the checkpoint only with accepted changes. Unsupported versions, unmapped status labels, broken references and ambiguous mappings should fail review.

An uploaded ACL string is not authorization. Only a trusted adapter or authorized administrator may establish a policy reference. Enforce effective access server-side on records, graph edges, aggregates, search and exports. A manager relationship alone should not grant access to restricted projects or employee cost. Capture policy freshness separately from content freshness and deny access when required permission evidence expires.

## Automated and manual tracking

| Field class | Proposed authority | Manual behavior |
| --- | --- | --- |
| Identity, employment state, formal manager | Approved directory | Suggest correction; preserve authoritative value until approved reconciliation |
| Source delivery state, ticket dates, actual time | Designated delivery/time system | Display source value and freshness; local annotation cannot silently change it |
| Strategic priority, project health, forecast allocation | Named planning owner/system | Editable if locally owned; retain author, reason, effective dates and revision |
| Expense actual, budget, currency conversion | Approved finance source/policy | Distinct proposed adjustment; no silent replacement of posted actuals |
| Local project or planning assumption | Periscope | Manual create/edit with stable local ID; explicit linking when a source record appears |

Store imported values, manual overrides and calculated values separately. Each effective field needs provenance, observation time, precedence rule and any override expiry. On source refresh, retain the new underlying value and flag conflicts instead of silently erasing edits. Start with read-only connectors and local annotations. Future source writeback needs explicit field authorization, optimistic concurrency, an outbound audit record, idempotency and readback confirmation. It is not implied by importing a record.

Preserve original currency and amount, accounting period, expense category, source transaction ID, approval state and reversals. Converted totals require a named rate source, rate date and reporting currency. Keep budget, forecast, committed spend and actuals separate. Deduplicate mirrored time/cost records through authoritative transaction links. Never fabricate salaries or individual costs from role, FTE, story points or presumed rates.

Time attribution needs person ID, project ID, work date, timezone, unit, approval status and adjustment lineage. Planned allocation, available capacity and approved actual time answer different questions. Declare calendar/holiday rules and how shared work is allocated; missing time is unknown, not zero. Financial and time models here are proposed extensions to the current capacity model.

## Reliability and acceptance

Stage each run before publication. Validate referential integrity, reporting cycles, status mappings, units, currencies, required dates, duplicates, source scope and permissions. Publish a coherent revision with per-source counts; quarantine failed runs without presenting partial coverage as complete. Distinguish authentication failure, permission loss, rate limiting, schema drift and invalid records in actionable diagnostics without logging credentials or unrestricted raw payloads.

Use idempotency keys, bounded retries, durable job state, checkpoint recovery and overlap windows for late updates. Retain prior accepted revisions and mapping versions for a reviewed compensating rollback. A failed page, revoked permission, or incomplete snapshot must never imply deletion. Require an explicit deletion event or a successfully reconciled complete scope before creating a tombstone; preserve historical references under the enterprise retention policy.

Acceptance fixtures should prove duplicate delivery is harmless; missing pages do not delete records; revoked access removes visibility; renamed people retain relationships; stale writes cannot win; manual overrides survive refresh; totals reconcile to source; and restart/rollback works. Show last successful update, coverage, rejected counts and stale sources in the product. Freshness targets and alert ownership must be agreed per source, not marketed as universally real time.

## Deployment and decisions still required

A static frontend can call an enterprise backend and render authorized data. A static bundle cannot keep connector secrets, run dependable background synchronization, receive durable webhooks, or independently provide shared manual writes and history. Those responsibilities need trusted services and persistent storage somewhere. An existing enterprise integration platform may provide them; the frontend being static does not remove the dependencies.

Retain Next.js/SQLite for the local pilot. A shared deployment needs an approved authentication boundary, authorization, backup/restore, secret management, retention and operations model. Choose any later database migration based on concurrent writers, availability and data scale. A graph visualization does not by itself require a graph database.

Before the first live connector, obtain source owners/specifications, deployment versions, anonymized examples, immutable-key crosswalks, field authority, permission policy, classification/retention, refresh targets, expected scale, network route, deployment owner and acceptance dataset. For trackIT/whoswho this discovery is a prerequisite to any API claim. Build and validate one read-only source end to end before generalizing the adapter framework.

All linked vendor/standards sources above were accessed on **2026-09-12**. They verify documented interfaces, not this enterprise's configuration, licensing, data quality, or authorization.

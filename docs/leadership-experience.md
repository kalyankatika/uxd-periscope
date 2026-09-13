# Leadership experience

The product starts with three questions: what matters most, who is working on it, and where leadership can help. The capacity planner is a supporting tool.

## Industry patterns considered

- [Asana portfolios](https://help.asana.com/s/article/monitor-initiatives-and-manage-resources-with-portfolios): aggregate projects into a leadership overview, while retaining project detail and workload views. Applied here as an executive brief plus project drill-downs.
- [Atlassian Teams](https://www.atlassian.com/platform/platform-apps/teams): make teams a shared directory across work. Applied here as stable person identities, explicit reporting relationships, and rollups that include a leader's descendants.
- [Productboard roadmap guidance](https://support.productboard.com/hc/en-us/articles/39533393517715-Popular-roadmaps-guide): connect objectives, initiatives, and implementation work, and choose a view suited to the audience. Applied here as business priorities, projects, and a consistent leadership comparison grid.
- [Obsidian graph view](https://obsidian.md/help/plugins/graph): navigate relationships with pan, zoom, colored groups, connection highlighting, and local graph depth. Applied here as the opening Work map with a plain-language inspector.

These are interaction and information-architecture references, not claims of product integration or a reproduction of proprietary systems.

## Views

- **Overview:** explicitly designated top priorities, reported delivery concerns, and leader cards.
- **Teams & reporting:** reporting tree and the deduplicated union of projects owned by or involving the leader and their reports.
- **Projects:** the same criteria for every project, with team filters, search, review filters, column sorting, and a CSV export of the current view.
- **Work map (opening view):** a force-directed knowledge graph of priorities, projects, leaders, and people. Select or search for a node to highlight connections and open its detail panel. Leaders reveal the work across their reporting lines. Solid lines show project involvement and priority links; dotted lines show reporting relationships; dashed lines show dependencies. Direction is explained in the inspector. Filters support top-priority projects and work needing attention, retaining related people and reporting chains. Local focus explores one to three relationship steps. Node size reflects direct links within its category; position has no business meaning. Dragging, zooming, and category visibility are session-only view changes. All graph nodes are keyboard selectable, and Browse list offers an equivalent selection path.

Labels such as “on track” and “needs a decision” come from explicit project updates. The application does not infer delivery health from dates or staffing. Time estimates are kept below the leadership story and explained as combined full-week time, not assigned headcount.

The Work map also has a **Grid** view. Cards retain the same graph identities and selected period, with owners for projects, teams for people, and supporting work for priorities. Type filters, priority/attention filters, connection focus, and the selected detail panel carry across views. Grid search narrows the filtered items; sorting supports type, name, and number of connections. Connection counts reflect the visible graph before the search narrows cards. Team and supporting-project counts cover the selected period. **View on map** returns to the graph with the same selection.

Project details show the full **Related projects** list and its total. Direct prerequisites and dependents appear first, with the direction explained on each row. Other relationships include a shared business priority or people involved as an owner or contributor on either project. Each project appears once with all applicable reasons; names are display labels, never relationship keys. Selecting a related project opens its details at the top and focuses the new heading. These navigation actions do not save or change project records.

## Portable relationship model

- Person `id` is stable; `managerId` records reporting relationships. Reporting cycles and unknown managers are rejected.
- Project `leadId` and `memberIds` link accountable people and contributors. Their project rolls up through their reporting chain, even when a project lead is not a department head.
- `dependsOn` links project dependencies. `priority` links work to a shared business outcome.
- `/api/graph` returns the saved workspace as JSON-LD using stable URNs, Schema.org Person/Project types, and a documented `urn:periscope:vocab:` namespace for application relationships.
- The “Export connected data” button exports the dataset currently on screen. The API always reads the persisted workspace. Example mode is explicitly local to the current session.
- No external source is automatically synchronized. Connectors can use the existing plan API and graph export as an interchange boundary; authentication is required before any shared deployment.

CSV person fields include optional `title`, `team`, `managerId`, and `isLeader` (`true`/`false`). Project CSVs include optional `leadId`, `memberIds`, `dependsOn`, `importance`, `health`, `decision`, and `update`. Multiple IDs are separated by `|`. **Import organization** reviews people and projects together and saves the combined plan in one transaction. For separate uploads, import people before projects that reference them. Existing columns remain supported. Saving a plan validates all references together.

## Example and saved data

An untouched starter workspace opens an explicitly labeled fictional organization with 26 people, seven leadership teams, 13 projects, and five top priorities. Example edits stay in memory for the current session. “Open workspace” returns to the persisted data; it never overwrites or merges the example automatically. Custom workspaces open directly to their saved data. Reporting details and project links are stored in SQLite with backward-compatible metadata columns.

The example teams are Product Design, Research & insights, Content design, Design systems, Design Strategy, Innovation, and UX AI. New projects cover UXD product design strategy, service concept pilots, a conversational planning prototype, UX AI interaction standards, and AI-assisted research synthesis. Each team has a leader and reports, with contributors and dependencies connecting it to other teams.

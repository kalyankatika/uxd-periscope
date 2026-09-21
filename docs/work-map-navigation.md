# Work map navigation

The original Work map is the single graph entry. The former Graph workspace/Standard workspace choice has been removed; old `/?view=graph` links open this same experience.

## Select and review

- Select a person to view their reporting subtree and its projects in the planning period. Project owners, contributors and priorities provide relationship context; they do not imply that all connected people report to the selected leader.
- Select a project to inspect its owner, contributors, priority and dependencies.
- Select a priority to review supporting projects.
- Switch Map/Grid without changing the selected scope. Grid is the readable comparison alternative to the network.
- Back returns to a previous selection. Whole organization clears the selection and filters. These controls describe exploration; they do not claim the click path is an organizational hierarchy. Actual hierarchy remains in Reports to and reporting lines.
- Edit a person or add a direct report from the inspector. Open project details to review/edit work.

## Other views

The familiar sidebar remains visible. Overview, Projects, Teams & reporting, Capacity, Project plan, and People & imports are organization-wide entry points. Back to Work map restores the existing selection, view and camera. View in map from a project drawer targets that project, including when the drawer was opened from another view.

Capacity remains discipline-level forecasting. The interface does not invent individual or group allocation from project membership. Session-only example data and the saved SQLite workspace retain their existing separation. Graph scope follows stable person/project IDs, and changing data mode resets the map.

Navigation is not persisted across reloads. Priority identity, source freshness, enterprise permissions and integrations require separate data-contract work. This focused change adds no AI execution or live synchronization.

## Map layouts

Use **Layout → By team** to review work grouped under accountable leaders. **Network** remains the default relationship view. This changes arrangement only: selection, period, filters, inspector and Grid use the same underlying scope.

Each project appears once, grouped by its owner's reporting chain. Contributors can span groups without duplicating projects. Missing owners or invalid reporting chains appear under Unassigned; shared priorities have a separate group. Group project counts mean accountable ownership, not all work involving that team's members or capacity allocation.

At overview scale, group summaries keep names and counts readable. Select a group to zoom into its people and projects; this does not filter the scope. Select a node to inspect its connections and reveal cross-group links. Narrow screens stack the groups; pan to explore and use Grid for comparison. Reporting lines retain their existing hierarchy layout. Layout choice is session-only.

# Graph workspace

An alternative to the standard workspace, using the existing knowledge graph as the starting point. Open **Graph workspace** in the left navigation or use `/?view=graph`. **Standard workspace** returns to the familiar navigation.

## Navigation

- Select a person, project or priority to focus connected work.
- Follow reports, project owners, priorities and dependencies through the inspector.
- Use the graph breadcrumb to return to a previous selection or the whole graph.
- Open project details and existing editing actions from the selected item.
- Use **Workspace tools** for the existing overview, project comparison, reporting, capacity, project plan and people/import tools. These cover the whole workspace, not just the selected node. **Back to graph** restores the selection and trail.

The original map/grid switch, filters, search, reporting layout and export remain available. The standard Work map keeps its existing selection behavior.

## Data and scope

Both experiences use the same plan and authoritative IDs. Edits update the graph from current plan data. Example data remains fictional and session-only; saved-workspace changes retain the existing local SQLite persistence and import review. Changing data mode resets graph context so IDs from different workspaces cannot be mixed.

Graph navigation is session state, not a saved or shareable path. The URL selects the experience only. Capacity remains discipline-level planning; individual actuals, expense tracking, live enterprise synchronization and autonomous AI execution are not implemented by this alternative.

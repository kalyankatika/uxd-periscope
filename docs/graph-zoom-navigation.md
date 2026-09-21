# Team graph: return navigation

Research captured September 20, 2026. Recommendation only; no UI changes in this document.

## Current issue

Clicking a team header changes the camera without changing the selected scope. Therefore the existing selection Back/Whole organization navigation may not appear. Fit (and the graph-focused 0 shortcut) restores the fitted camera, but its label does not communicate returning from a team close-up. Reset view exists below the graph and clears selection and filters as well, making it a different operation.

## Industry evidence

- Miro groups zoom, fit-to-screen, minimap and fullscreen into a persistent board-navigation toolbar: https://help.miro.com/hc/en-us/articles/360017731053-Using-Miro-with-a-mouse-trackpad-or-touchscreen
- React Flow provides zoom in, zoom out and fit-view controls together: https://reactflow.dev/api-reference/components/controls
- Obsidian provides wheel and plus/minus zoom, drag/arrow-key navigation, and distinguishes global from local graphs: https://obsidian.md/help/plugins/graph

These support persistent viewport controls and distinguishing view scale from data scope. They do not prescribe Periscope's exact labels.

## Recommended minimal Periscope behavior

1. After a team-header zoom, show “Back to teams” visibly at the top-left inside the canvas, alongside the focused team name. Restore the preceding camera, retaining current filters, period, selection and layout. Scope this camera-return state to the current layout/data context; clear stale state when scope or layout changes.
2. Rename Fit to “Fit view” in the persistent minus/plus/percentage control. Fit currently visible, filtered graph content without clearing selection or filters. On mobile this action must actually fit the content; the initial stacked browsing camera is a separate default.
3. Keep “Whole organization” for leaving a selected person/project scope. Do not label camera zoom history as a reporting breadcrumb.
4. Keep the existing 0 shortcut when the graph has focus. Visible buttons remain the primary path. Preserve Escape's existing list/fullscreen behavior rather than adding competing meanings.
5. Respect reduced-motion preferences if adding a brief camera transition. Keep all nodes present during navigation.

Defer a minimap until users need to navigate a substantially larger graph. Defer a zoom menu and arbitrary percentage entry. Neither is needed to solve the reported dead end.

## Acceptance

- Whole organization → team header → Back to teams restores the preceding view without changing node IDs or filters.
- Scoped leader → team header → Back to teams retains the leader scope.
- Fit view includes all currently visible nodes on desktop and mobile; it does not clear filters.
- Return control is visible within the canvas without page scrolling and operable by keyboard/touch.
- Switching layouts, importing data, or changing scope cannot restore a stale camera-return context.
- Close list/fullscreen keyboard behavior remains unchanged.

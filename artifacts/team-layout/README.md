# By team layout verification

Fictional example only. Production build, 71 unit tests, and saved SQLite SHA256 unchanged.

Verified:
- Network is the default; By team is available in the existing layout selector.
- Account opening redesign selection survives Network/By team and Map/Grid switching. Grid retains the same ten scoped entities.
- Desktop overview shows readable group summaries; selecting Elena zooms to people and accountable projects.
- 390px viewport has no document overflow. Groups stack and Daniel's group opens with readable nodes.
- Browser reported no runtime errors.

Screenshots: desktop.png, group.png, mobile.png, mobile-group.png.
Tests/build logs and browser action logs are included. Some early browser commands used unsupported text selectors; subsequent element-reference commands successfully verified the intended interactions. Desktop screenshots precede the final singular-count wording correction. Mobile screenshots reflect the final build.

Grouping is ownership, not allocation. Group counts differ from selecting a leader's broader related-project scope. Cross-group edges are suppressed until an endpoint is selected or hovered; overview summaries suppress all edges until zoomed in.

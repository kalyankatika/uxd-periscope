# Static deployment verification

September21,2026. Fictional snapshot only.

-89tests and typecheck passed.
-Normal Next/SQLite production build passed.
-Static root and /periscope/ exports passed; generated route list contains only static pages.
-Staging excludes app/api and lib/db.ts. Output contains fictional JSON, HTML, JS, CSS and fonts, no SQLite file.
-Root static browser loaded47nodes. Snapshot mode hides Add/Edit/Move/import and reporting drag controls. Project/person details and matrix remain navigable.
-Scoped Elena matrix showed9projects; this matches the retained scope rather than whole-organization13.
-390px browser had no horizontal document overflow.
-Replacing only the generated snapshot with malformed data caused Data unavailable, with no fictional fallback. Restoring fixture and Retry recovered47nodes.
-Static host GET /api/plan returned404; PUT returned405.
-Subpath browser loaded47nodes, fonts loaded and logo resolved within /periscope/.
-Normal local preview retained Add project and Open workspace. Source data SHA256 unchanged:
92954d7f17c97402d006175836fe3db296872b170787f349b43264e39d7fcd37

Root export was restored after subpath testing. Build output is intentionally ignored; teammates reproduce with npm run build:static. Authentication, enterprise API normalization and source-platform deep links remain future integrations.

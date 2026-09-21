# Static deployment: JSON now, API later

Periscope has two deployment modes. Static mode is intended for sharing a read-only demonstration or a protected enterprise snapshot. The normal local Next.js/SQLite workspace remains available.

## Build and preview

Use Node.js22.13 or later and npm. From this repository:

```sh
npm ci
npm run build:static
npm run preview:static
```

Open http://127.0.0.1:3001/. This serves generated files only. No SQLite file or Next.js application server is required at runtime. Node.js is used to build and for this optional local preview; the exported folder can be served by another static web server.

Publish the contents of **static-site/** to your approved static host. Do not publish the repository, saved database, environment files or build staging folder. The supplied snapshot is entirely fictional.

The build runs in isolated **.static-build/**, omits database code and API routes, and does not change the normal **.next/** build or saved SQLite workspace. Rebuilding replaces static-site, including any configuration or data changes made directly there. Keep approved deployment data outside the generated folder and copy it in after each build.

For a host subdirectory, build with the matching prefix:

```sh
PERISCOPE_BASE_PATH=/periscope npm run build:static
PERISCOPE_BASE_PATH=/periscope npm run preview:static
```

Serve the output at /periscope/ with a trailing slash. The prefix is a build setting; rebuild if it changes. This is HTTP hosting, not opening index.html directly with file://.

## Replace the fictional data

1. Use examples/uxd-demo/workspace.json as the canonical shape: people, initiatives and revision.
2. Preserve stable IDs and valid manager, owner, member and dependency references. Existing schema validation rejects broken references, cycles and unknown statuses. CSV conversion remains a separate preparation step; the static viewer does not offer imports.
3. Copy the approved snapshot to static-site/data/workspace.json.
4. Edit static-site/data/config.json:

```json
{
  "dataUrl": "./workspace.json",
  "label": "UXD portfolio snapshot",
  "fictional": false,
  "sourceUpdatedAt": "2026-09-21T12:00:00Z"
}
```

dataUrl resolves relative to data/config.json. sourceUpdatedAt is optional and must be a truthful timestamp from the publishing process; it is not inferred from the time someone opens the site. Keep fictional true for example data. Refresh data reloads configuration and data, validates them, and resets temporary navigation/scenario state.

No valid source means an explicit error with Retry. There is no fallback to fictional data. The viewer makes no save requests; edits remain in the source platform or upstream snapshot-publishing process.

## API later

Point dataUrl to an approved endpoint returning the same JSON contract. No interface rewrite is needed for an endpoint that already satisfies that contract. Raw Jira/directory responses still require agreed mappings and normalization.

Prefer a same-origin enterprise gateway protected by your organization's authentication and authorization. The loader uses same-origin credentials; it does not contain secret keys, OAuth setup or a cross-origin credential flow. A different-origin API must permit the deployment origin through CORS and provide an appropriate browser-safe access design. These are enterprise integration tasks, not implemented connectors.

Protect both the application and JSON/API data at the host or gateway. Static files are readable by anyone allowed to download them; hiding editing controls is not data-access enforcement. No source-system edit privileges are granted by this viewer. Verified source-record links can be added once source provenance is mapped; Open in source is not yet implemented.

## What works

Network, By team, By priority, card grid, Team × priority, project details, reporting navigation, Overview, Timeline, capacity analysis and exports. Capacity scenarios are temporary local calculations, not edits to authoritative data.

Source-backed project/person editing, add/remove/reparent, uploads and database saving are unavailable in static mode. The normal local mode retains its existing editing and session-only fictional demonstration behavior:

```sh
npm run build
npm run start
```

A static site does not write back to its JSON file. Multi-user writes, source synchronization, SSO configuration, audit history and scheduled refresh ingestion are outside this deployment mode.

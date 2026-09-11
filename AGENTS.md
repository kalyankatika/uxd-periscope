# Periscope development

Develop this project agentically within the user's requested scope: inspect, implement, validate, fix failures, and deliver a working result. Resolve routine implementation choices without repeated confirmation. Ask only for information or authorization that is actually missing. Do not create recurring jobs or external communications without a request.

- Preserve the local Next.js / SQLite architecture and the user's saved workspace. Treat the fictional example as session-only data.
- Use concise software labels. Preserve Fidelity Sans, primary button color `#368727`, rounded action buttons, and the Work map interaction design unless the user requests a change.
- Treat person and project IDs as authoritative relationship keys. Never infer identity from a display name. Review import mappings and reject broken references or unrecognized status labels.
- For functional changes, run relevant tests and `npm run build`; fix material failures. For copy and style edits, avoid tests that merely repeat implementation text. Keep the local app running with the current build.
- Use browser interaction and recording when requested or otherwise explicitly authorized. Demonstrations use fictional data, and must distinguish recorded behavior from unimplemented capabilities.
- Maintain the import contract in `docs/enterprise-data-mapping.md`. Live enterprise data collection requires the actual source and agreed mappings; do not manufacture company data or claim synchronization exists.
- Report completed behavior, validation, the working preview or artifact, and any material limitation. Continue authorized work to completion rather than stopping with a plan.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

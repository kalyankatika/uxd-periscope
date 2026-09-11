# Periscope platform demo

**Short silent cut: [periscope-overview-demo.mp4](periscope-overview-demo.mp4) · 40 seconds · 1920 × 1080**

Opens with the full platform overview, visible branding and navigation, priorities, and team cards. The next scene navigates into Work map and expands it, followed by project connections, Grid view, team projects, and capacity. Brief on-screen captions, quarter-second dissolves, and a closing title replace narration. The MP4 contains no audio track. All footage was recorded from the running app with fictional data. Complete decode and visual spot checks passed; recording reported no browser errors. The earlier map-first cut remains at `periscope-short-silent.mp4`.

`overview-demo-scenes.json` records the scene timings and `overview-demo-validation.json` records the media checks. `overview-demo-poster.png` is the cover frame. Regenerate with `scripts/make-short-demo.py` using `AGENT_BROWSER_BIN`, `FFMPEG_BIN`, and ffmpeg on PATH; optional `record` and `render` arguments run those stages separately. Recording accepts start and exclusive stop indexes for retakes and retains the other scenes.

## Full walkthrough

**3 minutes 2 seconds · 1920 × 1080 · narrated MP4**

A recorded walkthrough of the running local Periscope app. The footage uses 26 fictional people, seven teams, 13 projects, and seven business priorities. No real enterprise data is shown or connected. The narration is a local synthesized voice.

## Files

- `periscope-platform-demo.mp4`: H.264 video with AAC stereo narration and visible chapter labels.
- `periscope-platform-demo.srt`: chapter captions, not a word-for-word narration subtitle track.
- `transcript.md`: full narration with chapter timestamps.
- `poster.png`: preview frame.
- `people-example.csv` and `projects-example.csv`: reusable example exports using recognized display headers and labels.
- `example-plan.json` and `example-graph.jsonld`: the same example as a complete plan and portable graph.
- `periscope-example-data.zip`: both CSVs, the plan, the graph, and the enterprise mapping guide.

## Chapters

| Start | View |
| --- | --- |
| 00:00 | Work Map |
| 00:24 | Project Connections |
| 00:45 | Teams And Reporting |
| 01:07 | Priorities And Decisions |
| 01:25 | Leadership Overview |
| 01:42 | Project Comparison |
| 02:02 | Capacity And Project Plan |
| 02:22 | Enterprise Data Mapping |
| 02:45 | Connected Workspace |

## Use the example files

Open the app at `http://127.0.0.1:3000` and use Example data. In People & imports, select the import type and upload its CSV. Review the column and label mappings before confirming. People must exist before importing projects that reference them. Example imports stay in the current session.

For real source data, follow [the enterprise mapping guide](../../docs/enterprise-data-mapping.md). IDs preserve identity; display names do not resolve reporting or project links. Import validation rejects unknown references, reporting cycles, unsupported labels, and conflicting team/priority spellings. Real source connectors and synchronization are not implemented.

## Validation

- 23 automated tests passed; the production build passed.
- Recorded map expansion, dragging, zoom, project inspection, connection depth, leader drill-down, attention filters, overview, grid filters/sorting, capacity scenarios, project plan, and a successful 13-project example import.
- No browser runtime errors in the final recording session or final page reload.
- All nine rendered chapters were visually checked. The complete MP4 decoded successfully; narration is present without clipping.
- Saved SQLite workspace remains at revision 1 with 12 people and five projects; it was not overwritten by the demo.

## Regenerate

The scripts require Python 3, agent-browser, ffmpeg, and macOS `say` (Samantha voice). Set `AGENT_BROWSER_BIN` and `FFMPEG_BIN` to installed executable paths. Ensure ffmpeg is on PATH for the browser recording process, the app is running on port 3000, and the owned `periscope-map-demo` browser session uses a 1600 × 900 viewport.

Run `python3 scripts/record-platform-demo.py`, then `python3 scripts/render-platform-demo.py --audio-only`, and finally `python3 scripts/render-platform-demo.py`. Raw recordings and narration use `/tmp/periscope-map-video`, overridable with `DEMO_WORK_DIR`. Recording accepts optional zero-based start and exclusive stop chapter indexes for individual retakes.

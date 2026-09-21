# Periscope demo reel playbook

Repeatable production reference for the silent reel the Head of UXD liked. Style captured September 18, 2026. Latest footage recorded September 21 from the static JSON build at source commit `dbc61a5`.

## Reference assets

- [Approved-style reel](../artifacts/platform-demo/periscope-overview-demo.mp4): the visual and pacing reference.
- [Cover frame](../artifacts/platform-demo/overview-demo-poster.png), [scene timings](../artifacts/platform-demo/overview-demo-scenes.json), and [last media validation](../artifacts/platform-demo/overview-demo-validation.json).
- [Recording and rendering script](../scripts/make-short-demo.py): executable source of truth for scenes, captions, styling and timings.
- [Fictional dataset](../examples/uxd-demo/README.md) and [installation guide](installation.md).

## Creative contract

Start with the platform overview: branding, navigation, priorities and teams. Then move into the map and progressively narrower views. Show real interactions with enough time to read their results. Use concise software labels, restrained dissolves and a simple closing brand card. No narration, music or audio track. Do not replace recorded behavior with mock screens.

| Setting | Reference |
| --- | --- |
| Duration | 40 seconds total |
| Browser viewport | 1600 × 900, desktop, 100% zoom |
| Delivery | 1920 × 1080, 30 fps, H.264 MP4, yuv420p, fast-start |
| Composition | Footage scaled to 1760 × 990, centered with 80 px side gutters; caption strip below |
| Typography | Repository Fidelity Sans Regular and Bold |
| Colors | Background `#14231a`; accent rule `#368727`; chapter text `#a2df94`; white captions |
| Transitions | 0.25-second crossfades |
| Closing card | Periscope / UXD / Projects · People · Priorities |
| Disclosure | Visible `FICTIONAL DATA` throughout the footage |

Keep the current product conventions visible: persistent left navigation, compact workspace-status header, planning period in the page toolbar, consistent outline icons and rounded green action buttons. Avoid unrelated product changes during a recording run.

## Storyboard and observable outcomes

Start times include transition overlap. The script trims setup activity before each scene.

| Start | Scene | Required visible outcome |
| --- | --- | --- |
| 0.00s | Platform overview | Priorities, health and decisions; scroll to team cards |
| 8.25s | Work map | Fullscreen network; select UX AI interaction standards |
| 14.50s | By team | Switch layout; zoom to Elena Brooks’s group |
| 20.25s | By priority | Switch layout; zoom to Responsible AI experiences |
| 26.00s | Team × priority | Select Elena × Advisor productivity; reveal related project |
| 31.75s | Project timeline | Delivery bars grouped by priority; scroll through projects |
| 37.50s | Closing card | Periscope branding; finish at 40 seconds |

The reference fixture has 27 people, 13 projects and seven priorities: 47 map nodes. Planning period is October 2026. Elena has two direct reports, one indirect report and nine related projects. The hierarchy includes Elena → Maya → Nina. Capacity is discipline-level forecast effort, not individual time tracking or actual expenses.

## Repeat the setup

Run from the repository root. Prerequisites: the repository's supported Node version, Python 3, an installed agent-browser CLI with its browser runtime, and ffmpeg with libx264, drawtext and xfade support. Tool binaries are local prerequisites; they are not bundled in this repo. Use your own installed executable paths, not paths copied from another developer's machine.

Use a fresh shell for recording. The current recorder targets `http://127.0.0.1:3001` (override with `DEMO_URL`); reuse a verified current preview there or start an isolated instance below. Do not start a second process on an occupied port or stop another person's server. An isolated checkout is useful when another app build is running.

```sh
npm ci
npm run demo:check
npm run build:static
npm run preview:static
```

Leave that terminal running. In another terminal, from the same repository root:

```sh
export AGENT_BROWSER_BIN="$(command -v agent-browser)"
export FFMPEG_BIN="$(command -v ffmpeg)"
test -x "$AGENT_BROWSER_BIN" && test -x "$FFMPEG_BIN"
export PATH="$(dirname "$FFMPEG_BIN"):$PATH"
export DEMO_WORK_DIR="$(mktemp -d)/periscope-reel"
python3 scripts/make-short-demo.py record
python3 scripts/make-short-demo.py render
```

Use the default fictional JSON source in the read-only static build. No import or saved-workspace write is needed. The script checks the fictional banner and waits for fonts and 47 map nodes. Each scene starts from a fresh page. Raw WebM takes, screenshots and `takes.json` stay in `DEMO_WORK_DIR`; the renderer overwrites the committed MP4, cover and scene manifest under `artifacts/platform-demo`.

Keep the same `DEMO_WORK_DIR` to retake a scene, then render again. Indexes are zero-based; the stop index is exclusive:

```sh
# Retake only By team (scene 2).
python3 scripts/make-short-demo.py record 2 3
python3 scripts/make-short-demo.py render
```

## Review before sharing

1. Watch the whole MP4. Confirm the opening is Overview, every storyboard outcome is actually shown, captions are legible, and transitions contain no loading screens, accidental menus or abrupt empty frames. A successful click command alone does not prove the destination appeared.
2. Inspect both grouped layouts, the selected project inspector, the matrix project list and the timeline bars. Keep the fictional disclosure visible. Do not imply live enterprise integrations, AI execution, person-level bookings or other unimplemented capabilities.
3. Confirm the recording reports no browser errors. If labels change, inspect a fresh accessibility snapshot and update script selectors. Do not guess replacement controls. If the fixture changes, reconcile counts, expected outcomes and the node wait together; never silently reuse stale footage.
4. Decode the complete output and inspect its streams:

```sh
"$FFMPEG_BIN" -v error \
  -i artifacts/platform-demo/periscope-overview-demo.mp4 -f null -
"$FFMPEG_BIN" -hide_banner \
  -i artifacts/platform-demo/periscope-overview-demo.mp4
```

The first command must exit successfully without decode errors. The second prints media information and then exits nonzero because no output was specified; that is expected. Verify duration `00:00:40.00`, `1920x1080`, `30 fps`, and **no Audio stream**.

5. Update `overview-demo-validation.json` with the new recording date, file byte count and actual check results. The renderer does not refresh this file automatically. Record the app commit and tool versions in the handoff when reproducing on a new machine. Never copy a previous pass without rerunning the checks.
6. Commit the MP4, cover, scene manifest, validation and any script changes together. Update the demo README and BUILD_STATE. Push to the agreed branch and verify the remote revision before sharing the GitHub video link. Do not commit raw footage, saved databases, credentials or real enterprise records.

## Reusable request

> Refresh the Periscope silent demo using docs/demo-reel-playbook.md and the existing recording script. Preserve the 40-second, overview-first format, Fidelity typography, captions, dissolves and closing card. Record the current app with the fictional fixture; verify each scene visually, full decoding and absence of audio. Update the artifacts and validation together. Preserve the saved workspace and report the output path and source revision. Do not claim capabilities that are not demonstrated.

This playbook preserves the recipe and intent, not pixel-identical output: browser versions, font rendering and graph settling can vary. Use the reference reel for visual comparison and the storyboard for behavioral acceptance.

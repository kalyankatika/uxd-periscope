"""Record and render a 40-second silent Periscope demo with fictional data.

Requires AGENT_BROWSER_BIN, FFMPEG_BIN, and ffmpeg on PATH. Use `record`
or `render` as the first argument, optionally followed by a zero-based
recording start and exclusive stop indexes. Raw footage stays in DEMO_WORK_DIR.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts/platform-demo"
WORK = Path(os.environ.get("DEMO_WORK_DIR", "/tmp/periscope-short-demo"))
WORK.mkdir(parents=True, exist_ok=True)
SESSION = "periscope-static-demo"
URL = os.environ.get("DEMO_URL", "http://127.0.0.1:3001")
SCENES = [
    ("overview", "PLATFORM OVERVIEW", "Projects, priorities and decisions", 8.5),
    ("map", "WORK MAP", "Explore projects and their connections", 6.5),
    ("teams", "BY TEAM", "See ownership across design leaders", 6),
    ("priorities", "BY PRIORITY", "Group work by strategic priority", 6),
    ("matrix", "TEAM × PRIORITY", "Compare teams and drill into projects", 6),
    ("timeline", "PROJECT TIMELINE", "Review delivery dates by priority", 6),
]


def browser(*args):
    result = subprocess.run(
        [os.environ["AGENT_BROWSER_BIN"], "--session", SESSION,
         *(str(round(a)) if isinstance(a, float) else str(a) for a in args)],
        capture_output=True, text=True, timeout=40,
    )
    if result.returncode or "✗" in result.stdout + result.stderr:
        raise RuntimeError(str(args) + "\n" + result.stdout + result.stderr)
    return result.stdout.strip()


def ref(name, role="button", contains=False):
    snapshot = browser("snapshot", "-i")
    for line in snapshot.splitlines():
        match = re.search(r'\b' + role + r' "([^"]*)".*\bref=(e\d+)\]', line)
        if match and (name in match[1] if contains else name == match[1].strip()):
            return "@" + match[2]
    (WORK / "failed-snapshot.txt").write_text(snapshot)
    raise RuntimeError("Missing " + role + ": " + name)


def click(name, contains=False):
    target = ref(name, contains=contains)
    browser("scrollintoview", target)
    browser("click", ref(name, contains=contains))
    time.sleep(0.35)


def select(name, value):
    browser("select", ref(name, "combobox"), value)
    time.sleep(0.35)


def record(start=0, stop=None):
    browser("open", URL)
    browser("set", "viewport", "1600", "900")
    path = WORK / "takes.json"
    takes = {take["name"]: take for take in json.loads(path.read_text())} if path.exists() else {}
    for index in range(start, len(SCENES) if stop is None else stop):
        name, label, caption, seconds = SCENES[index]
        print("Recording " + label, flush=True)
        browser("record", "start", WORK / (name + ".webm"), URL)
        began = time.monotonic()
        try:
            browser("wait", "--fn", 'document.fonts.status === "loaded" && document.querySelectorAll(".map-node").length === 47')
            if "Fictional organization" not in browser("get", "text", ".example-banner"):
                raise RuntimeError("Recording requires the fictional example")
            if name == "overview":
                click("Overview")
            elif name == "timeline":
                click("Project plan")
                click("Timeline")
                browser("scrollintoview", ".project-timeline")
            elif name == "matrix":
                click("Grid")
                click("Team × priority")
                click("Expand grid")
            else:
                click("Expand map")
            browser("mouse", "move", "20", "20")
            time.sleep(0.6)
            trim = time.monotonic() - began
            if name == "overview":
                time.sleep(4)
                browser("scrollintoview", ".teams-section")
                time.sleep(2.5)
            elif name == "map":
                time.sleep(2)
                click("Project: UX AI interaction standards", contains=True)
                time.sleep(2.5)
            elif name == "teams":
                click("By team")
                time.sleep(2.2)
                click("Zoom to group: Elena Brooks")
                time.sleep(2.2)
            elif name == "priorities":
                click("By priority")
                time.sleep(2.2)
                click("Zoom to group: Responsible AI experiences")
                time.sleep(2.2)
            elif name == "matrix":
                time.sleep(2)
                click("Elena Brooks, Advisor productivity: 1 projects. View projects.")
                time.sleep(2.5)
            elif name == "timeline":
                time.sleep(2.5)
                browser("scroll", "down", "350")
                time.sleep(2.5)
            browser("mouse", "move", "20", "20")
            browser("screenshot", WORK / (name + ".png"))
            time.sleep(0.3)
        finally:
            browser("record", "stop")
        takes[name] = {"name": name, "label": label, "caption": caption, "seconds": seconds, "trim": trim}
        path.write_text(json.dumps([takes[s[0]] for s in SCENES if s[0] in takes], indent=2))
    print(browser("errors", "--json"), flush=True)
    browser("close")


def render():
    ff = os.environ["FFMPEG_BIN"]
    font = ROOT / "app/fonts/FidelitySans-Regular.woff"
    bold = ROOT / "app/fonts/FidelitySans-Bold.woff"
    recorded = {take["name"]: take for take in json.loads((WORK / "takes.json").read_text())}
    if any(scene[0] not in recorded for scene in SCENES):
        raise RuntimeError("Six scenes are required")
    takes = [{**recorded[name], "label": label, "caption": caption, "seconds": seconds}
             for name, label, caption, seconds in SCENES]

    def run(args):
        subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", *args], check=True)

    rendered = []
    for index, take in enumerate(takes):
        source = WORK / (take["name"] + ".webm")
        probe = subprocess.run([ff, "-hide_banner", "-i", str(source)], capture_output=True, text=True)
        match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe.stderr)
        if not match:
            raise RuntimeError("Cannot probe " + str(source))
        raw_seconds = int(match[1]) * 3600 + int(match[2]) * 60 + float(match[3])
        usable = raw_seconds - take["trim"] - 0.1
        label = WORK / (take["name"] + "-label.txt")
        caption = WORK / (take["name"] + "-caption.txt")
        label.write_text(take["label"])
        caption.write_text(take["caption"])
        output = WORK / (take["name"] + ".mp4")
        vf = (
            f"trim=duration={usable},setpts=(PTS-STARTPTS)*{take['seconds'] / usable},"
            "fps=30,tpad=stop_mode=clone:stop_duration=1,"
            "scale=1760:990:flags=lanczos,pad=1920:1080:80:0:color=0x14231a,setsar=1,"
            "drawbox=x=0:y=990:w=1920:h=2:color=0x368727:t=fill,"
            f"drawtext=expansion=none:fontfile='{bold}':textfile='{label}':fontsize=22:fontcolor=0xa2df94:x=64:y=1023,"
            f"drawtext=expansion=none:fontfile='{font}':textfile='{caption}':fontsize=26:fontcolor=white:x=430:y=1020,"
            f"drawtext=expansion=none:fontfile='{font}':text='FICTIONAL DATA':fontsize=14:fontcolor=0xb1bcb4:x=1730:y=1027"
        )
        run(["-ss", str(take["trim"]), "-i", str(source), "-vf", vf,
             "-t", str(take["seconds"]), "-an", "-c:v", "libx264", "-preset", "fast",
             "-crf", "17", "-pix_fmt", "yuv420p", str(output)])
        rendered.append(output)
        print("Rendered " + take["name"], flush=True)
    end = WORK / "end.mp4"
    vf = (
        "drawbox=x=850:y=420:w=220:h=4:color=0x368727:t=fill,"
        f"drawtext=expansion=none:fontfile='{bold}':text='periscope':fontsize=76:fontcolor=white:x=(w-tw)/2:y=460,"
        f"drawtext=expansion=none:fontfile='{font}':text='UXD':fontsize=24:fontcolor=0xa2df94:x=(w-tw)/2:y=559,"
        f"drawtext=expansion=none:fontfile='{font}':text='Projects   ·   People   ·   Priorities':fontsize=28:fontcolor=0xb1bcb4:x=(w-tw)/2:y=622"
    )
    run(["-f", "lavfi", "-i", "color=c=0x14231a:s=1920x1080:r=30:d=2.5", "-vf", vf,
         "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p", str(end)])
    rendered.append(end)
    inputs = [arg for path in rendered for arg in ("-i", str(path))]
    filters = [f"[{i}:v]settb=AVTB,setpts=PTS-STARTPTS[v{i}]" for i in range(7)]
    previous = "v0"
    elapsed = 0
    starts = [0]
    for i in range(1, 7):
        current = f"blend{i}"
        elapsed += takes[i - 1]["seconds"] - 0.25
        starts.append(elapsed)
        filters.append(f"[{previous}][v{i}]xfade=transition=fade:duration=0.25:offset={elapsed}[{current}]")
        previous = current
    target = OUT / "periscope-overview-demo.mp4"
    run([*inputs, "-filter_complex", ";".join(filters), "-map", f"[{previous}]", "-an", "-t", "40",
         "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(target)])
    run(["-ss", "1", "-i", str(target), "-frames:v", "1", str(OUT / "overview-demo-poster.png")])
    (OUT / "overview-demo-scenes.json").write_text(json.dumps([
        {"startSeconds": starts[i], "label": t["label"], "caption": t["caption"]}
        for i, t in enumerate(takes)
    ], indent=2))
    print("Saved 40-second silent demo: " + str(target), flush=True)


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "all"
    if command in ("all", "record"):
        record(int(sys.argv[2]) if len(sys.argv) > 2 else 0,
               int(sys.argv[3]) if len(sys.argv) > 3 else None)
    if command in ("all", "render"):
        render()

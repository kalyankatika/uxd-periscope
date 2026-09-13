"""Log evaluation-only browser actions against the owned fictional-data session."""
import datetime
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
BIN = "/Users/kalyankatika/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64"
args = sys.argv[1:]
if len(args) > 1 and args[0] in {"click", "fill", "check", "uncheck", "select"}:
    # This CLI's click does not bring offscreen controls into view itself.
    scroll = subprocess.run([BIN, "--session", "periscope-alignment", "scrollintoview", args[1]], text=True, capture_output=True)
    with (ROOT / "browser-actions.jsonl").open("a") as log:
        log.write(json.dumps({"at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "args": ["scrollintoview", args[1]], "exitCode": scroll.returncode, "automaticPreparation": True, "outputText": scroll.stdout + scroll.stderr}) + "\n")
    if scroll.returncode:
        print(scroll.stderr, file=sys.stderr)
        sys.exit(scroll.returncode)
result = subprocess.run([BIN, "--session", "periscope-alignment", *args], text=True, capture_output=True)
logs = ROOT / "browser-logs"
logs.mkdir(exist_ok=True)
index = len(list(logs.glob("*.txt"))) + 1
name = f"{index:03d}-{args[0] if args else 'empty'}.txt"
(logs / name).write_text(result.stdout + result.stderr)
with (ROOT / "browser-actions.jsonl").open("a") as log:
    log.write(json.dumps({"at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "args": args, "exitCode": result.returncode, "output": "browser-logs/" + name}) + "\n")
print(result.stdout, end="")
print(result.stderr, end="", file=sys.stderr)
sys.exit(result.returncode)

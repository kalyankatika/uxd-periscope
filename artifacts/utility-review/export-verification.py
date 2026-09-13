#!/usr/bin/env python3
"""Verify captured UXD exports/DOM text against fictional records, read-only.

Run from any directory: python3 artifacts/utility-review/export-verification.py
Only export-verification.json is written. No product calculation helpers are used.
"""
from collections import Counter
from datetime import date, timedelta
from fractions import Fraction
from pathlib import Path
from urllib.parse import quote
import csv
import hashlib
import json
import math
import re

ROOT = Path(__file__).resolve().parent
PLAN = json.loads((ROOT / "example-plan.json").read_text())
PEOPLE = {p["id"]: p for p in PLAN["people"]}
PROJECTS = {p["id"]: p for p in PLAN["initiatives"]}
CRAFTS = {"design": "Design", "research": "Research", "content": "Content", "design_eng": "Design engineering"}
HEALTH = {"not_reported": "Not reported", "on_track": "On track", "at_risk": "At risk", "needs_decision": "Decision required"}
DELIVERY = {"planned": "Planned", "in_progress": "In progress", "blocked": "Blocked", "completed": "Completed"}
IMPORTANCE = {"top": "Top priority", "high": "High priority", "normal": "Standard"}
COUNTS = Counter()
FAILURES = []
RESULTS = {}


def check(group, name, actual, expected):
    COUNTS[group] += 1
    if actual != expected:
        FAILURES.append({"group": group, "check": name, "actual": actual, "expected": expected})


def numeric(group, name, actual, expected, tolerance=1e-10):
    check(group, name, math.isclose(float(actual), float(expected), rel_tol=tolerance, abs_tol=tolerance), True)


def fraction(value):
    return Fraction(str(value))


def participants(project):
    return ({project["leadId"]} if project["leadId"] else set()) | set(project["memberIds"])


def scope(root):
    result = {root}
    while True:
        more = {p["id"] for p in PEOPLE.values() if p["managerId"] in result}
        if more <= result:
            return result
        result |= more


def read_csv(filename):
    with (ROOT / filename).open(newline="", encoding="utf-8-sig") as source:
        return list(csv.DictReader(source))


# Names are absent as IDs in comparison CSVs. This fixture-only lookup is safe
# only after asserting uniqueness; it is not an import identity recommendation.
name_counts = Counter(p["name"] for p in PROJECTS.values())
check("fixture", "unique project names permit fixture-only CSV comparison", all(n == 1 for n in name_counts.values()), True)
by_name = {p["name"]: p for p in PROJECTS.values()}
marcus_scope = scope("marcus")
expected_sets = {
    "top-projects.csv": {p["id"] for p in PROJECTS.values() if p["importance"] == "top" and p["delivery"] != "completed"},
    "attention-projects.csv": {p["id"] for p in PROJECTS.values() if p["delivery"] != "completed" and (p["health"] in {"at_risk", "needs_decision"} or p["delivery"] == "blocked")},
    "marcus-projects.csv": {p["id"] for p in PROJECTS.values() if participants(p) & marcus_scope},
}
project_results = {}
for filename, expected_ids in expected_sets.items():
    rows = read_csv(filename)
    group = filename
    actual_names = [r["project"] for r in rows]
    actual_ids = [by_name[n]["id"] for n in actual_names if n in by_name]
    check(group, "all exported names exist uniquely in fixture", len(actual_ids), len(rows))
    check(group, "no duplicate project rows", len(set(actual_names)), len(rows))
    check(group, "exact project ID set via unique fixture names", sorted(actual_ids), sorted(expected_ids))
    check(group, "row count", len(rows), len(expected_ids))
    for row in rows:
        if row["project"] not in by_name:
            continue
        p = by_name[row["project"]]
        lead = PEOPLE.get(p["leadId"])
        expected = {
            "project": p["name"], "priority": p["priority"], "importance": IMPORTANCE[p["importance"]],
            "lead": lead["name"] if lead else p["owner"], "team": lead["team"] if lead else "",
            "progress": DELIVERY[p["delivery"]], "health": HEALTH[p["health"]],
            "outcome": p["summary"], "latestUpdate": p["update"], "helpNeeded": p["decision"],
            "start": p["start"], "end": p["end"], "peopleInvolved": str(len(participants(p))),
            "commitment": p["status"],
        }
        for key, value in expected.items():
            check(group, f"{p['id']}.{key}", row.get(key), value)
        numeric(group, f"{p['id']}.weeklyTimeInFullTimePeople", row["weeklyTimeInFullTimePeople"], sum(fraction(v) for v in p["effort"].values()))
    project_results[filename] = {"rowCount": len(rows), "verifiedProjectIds": sorted(actual_ids), "fieldChecksPerRow": 15}
check("fixture", "Marcus scope IDs", sorted(marcus_scope), ["amara", "ethan", "marcus", "sofia"])
check("fixture", "Marcus distinct project count", len(expected_sets["marcus-projects.csv"]), 8)
check("fixture", "Marcus membership occurrences", sum(len(participants(p) & marcus_scope) for p in PROJECTS.values()), 10)
RESULTS["projectExports"] = project_results


def urn(kind, identity):
    return f"urn:periscope:{kind}:" + quote(identity, safe="~()*!.'-")


graph = json.loads((ROOT / "example-graph.jsonld").read_text())
nodes = graph["@graph"]
by_urn = {n["@id"]: n for n in nodes}
expected_nodes = {}
for p in PEOPLE.values():
    node = {"@id": urn("person", p["id"]), "@type": "schema:Person", "schema:name": p["name"], "schema:jobTitle": p["title"], "team": p["team"]}
    if p["managerId"]:
        node["reportsTo"] = {"@id": urn("person", p["managerId"])}
    expected_nodes[node["@id"]] = node
for priority in {p["priority"] for p in PROJECTS.values() if p["priority"]}:
    node = {"@id": urn("priority", priority), "@type": "Priority", "schema:name": priority}
    expected_nodes[node["@id"]] = node
for p in PROJECTS.values():
    node = {
        "@id": urn("project", p["id"]), "@type": "schema:Project", "schema:name": p["name"],
        "schema:description": p["summary"], "schema:startDate": p["start"], "schema:endDate": p["end"],
        "deliveryStatus": p["delivery"], "health": p["health"], "importance": p["importance"],
        "commitment": p["status"], "weeklyEffort": p["effort"],
        "contributors": [{"@id": urn("person", identity)} for identity in p["memberIds"]],
        "dependsOn": [{"@id": urn("project", identity)} for identity in p["dependsOn"]],
    }
    if p["leadId"]:
        node["ledBy"] = {"@id": urn("person", p["leadId"])}
    if p["priority"]:
        node["supports"] = {"@id": urn("priority", p["priority"])}
    expected_nodes[node["@id"]] = node
check("graph", "context", graph["@context"], {"schema": "https://schema.org/", "@vocab": "urn:periscope:vocab:"})
check("graph", "revision", graph["revision"], PLAN["revision"])
check("graph", "no duplicate node IDs", len(by_urn), len(nodes))
check("graph", "exact node-ID set", sorted(by_urn), sorted(expected_nodes))
check("graph", "node type counts", dict(Counter(n["@type"] for n in nodes)), {"schema:Person": 26, "schema:Project": 13, "Priority": 7})
for identity, expected in expected_nodes.items():
    check("graph", f"complete node {identity}", by_urn.get(identity), expected)
edge_counts = Counter()
for node in nodes:
    for key in ["reportsTo", "ledBy", "contributors", "dependsOn", "supports"]:
        refs = node.get(key, [])
        if not isinstance(refs, list):
            refs = [refs]
        for ref in refs:
            edge_counts[key] += 1
            check("graph", f"resolved {key} reference from {node['@id']} to {ref['@id']}", ref["@id"] in by_urn, True)
check("graph", "edge counts", dict(edge_counts), {"reportsTo": 25, "ledBy": 13, "contributors": 32, "dependsOn": 7, "supports": 13})
RESULTS["graphExport"] = {"nodeCount": len(nodes), "nodeTypes": dict(Counter(n["@type"] for n in nodes)), "relationshipCounts": dict(edge_counts), "allNodeFieldsAndEveryRelationshipCompared": True}


# Independent daily enumeration, intentionally retaining the documented full
# weekly supply baseline while clipping project demand to quarter weekdays.
start, end = date(2026, 10, 1), date(2026, 12, 31)
week = start - timedelta(days=start.weekday())
weeks = []
while week <= end:
    weeks.append(week)
    week += timedelta(days=7)
available = {c: sum(fraction(p["fte"]) * (1 - fraction(p["nonProjectPct"]) / 100) for p in PEOPLE.values() if p["craft"] == c) for c in CRAFTS}
label_pattern = re.compile(r"^(Design engineering|Design|Research|Content), week of ([A-Za-z]{3} \d+): (\d+)%, ([\d.]+) allocated of ([\d.]+) FTE(, over capacity)?$")
craft_by_label = {label: craft for craft, label in CRAFTS.items()}
month_labels = {9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}
week_by_label = {f"{month_labels[w.month]} {w.day}": w.isoformat() for w in weeks}
capacity_results = {}
for suffix, statuses, scenario_label in [("committed", {"committed"}, "Committed"), ("proposed", {"committed", "proposed"}, "Committed + proposed")]:
    expected_cells = {}
    for craft in CRAFTS:
        for week in weeks:
            demand = Fraction(0)
            for p in PROJECTS.values():
                if p["status"] not in statuses:
                    continue
                for day_index in range(5):
                    day = week + timedelta(days=day_index)
                    if start <= day <= end and p["start"] <= day.isoformat() <= p["end"]:
                        demand += fraction(p["effort"][craft]) / 5
            ratio = demand / available[craft]
            rounded_pct = math.floor(ratio * 100 + Fraction(1, 2))
            status = "red" if ratio > 1 else "amber" if ratio > Fraction(4, 5) else "green"
            expected_cells[(craft, week.isoformat())] = (demand, available[craft], rounded_pct, status)
    csv_name = f"capacity-{suffix}.csv"
    rows = read_csv(csv_name)
    csv_keys = [(r["craft"], r["weekStart"]) for r in rows]
    check(csv_name, "56 rows", len(rows), 56)
    check(csv_name, "unique discipline-week keys", len(set(csv_keys)), 56)
    check(csv_name, "exact discipline-week keys", sorted(csv_keys), sorted(expected_cells))
    for row in rows:
        key = (row["craft"], row["weekStart"])
        if key not in expected_cells:
            continue
        demand, supply, pct, status = expected_cells[key]
        check(csv_name, f"{key} scenario", row["scenario"], scenario_label)
        numeric(csv_name, f"{key} available FTE", row["availableFte"], supply)
        numeric(csv_name, f"{key} allocated FTE", row["allocatedFte"], demand)
        check(csv_name, f"{key} rounded percentage", row["utilization"], f"{pct}%")
        check(csv_name, f"{key} threshold status", row["status"], status)
    dom_name = f"capacity-dom-{suffix}.json"
    labels = json.loads((ROOT / dom_name).read_text())
    check(dom_name, "56 captured DOM labels", len(labels), 56)
    dom_keys = []
    for label in labels:
        match = label_pattern.fullmatch(label)
        check(dom_name, f"parse label {label}", match is not None, True)
        if not match:
            continue
        craft_label, date_label, pct_text, demand_text, supply_text, over_capacity = match.groups()
        key = (craft_by_label[craft_label], week_by_label.get(date_label))
        dom_keys.append(key)
        check(dom_name, f"known discipline/week {label}", key in expected_cells, True)
        if key not in expected_cells:
            continue
        demand, supply, pct, status = expected_cells[key]
        numeric(dom_name, f"{key} displayed allocated FTE", demand_text, demand)
        numeric(dom_name, f"{key} displayed available FTE", supply_text, supply)
        check(dom_name, f"{key} displayed rounded percentage", int(pct_text), pct)
        check(dom_name, f"{key} explicit over-capacity text", bool(over_capacity), status == "red")
    check(dom_name, "unique discipline-week labels", len(set(dom_keys)), 56)
    check(dom_name, "exact discipline-week labels", sorted(dom_keys), sorted(expected_cells))
    totals = {c: sum(cell[0] for key, cell in expected_cells.items() if key[0] == c) for c in CRAFTS}
    capacity_results[suffix] = {
        "csvRowsVerified": len(rows), "domLabelsVerified": len(labels),
        "demandFteWeeksByCraft": {c: float(v) for c, v in totals.items()},
        "totalDemandFteWeeks": float(sum(totals.values())),
        "overCapacityWeeksByCraft": {c: [key[1] for key, v in expected_cells.items() if key[0] == c and v[3] == "red"] for c in CRAFTS},
        "csvStatusCounts": dict(Counter(r["status"] for r in rows)),
        "domOverCapacityLabelCount": sum(label.endswith(", over capacity") for label in labels),
    }
RESULTS["capacity"] = capacity_results
RESULTS["status"] = "pass" if not FAILURES else "fail"
RESULTS["checkCounts"] = dict(COUNTS)
RESULTS["totalChecks"] = sum(COUNTS.values())
RESULTS["failureCount"] = len(FAILURES)
RESULTS["failures"] = FAILURES
RESULTS["method"] = "Python standard library; raw fictional Plan, stable-ID graph comparison, set-based reporting traversal and independent daily Fraction arithmetic. No product helpers or browser output used as expected calculations."
RESULTS["caveats"] = [
    "Project comparison CSVs contain no stable IDs. Their unique fictional project names are used only to compare this known fixture after checking uniqueness; this does not establish a safe name-based import identity strategy.",
    "Numeric export fields are compared within 1e-10 to ignore ordinary binary floating-point serialization noise. String fields, ID sets, rounded percentages and status labels are exact comparisons.",
    "Captured DOM artifacts contain accessibility-label text, not CSS classes or pixel colors. They establish displayed numbers and explicit over-capacity labels; amber/green DOM color rendering is not verified by this script.",
    "Research on November 30 with proposed work is 2.4/2.39 = 100.4184%, correctly red/over capacity although the displayed percentage rounds to 100%.",
    "Capacity retains 14 full weekly supply baselines (70 equivalent weekdays) and clips demand to 66 quarter weekdays, following the documented contract. It excludes holidays, leave and named-person assignment constraints.",
    "Graph export is a relationship projection, not a lossless Plan backup: it does not include every raw field such as latest update, decision text, person FTE or non-project percentage. Verified completeness is against the stated node/relationship export fields.",
    "Captured exports and DOM labels represent the manager's browser evaluation of fictional example data. This verification does not establish behavior with real enterprise sources or later changed datasets.",
]
input_names = ["example-plan.json", "top-projects.csv", "attention-projects.csv", "marcus-projects.csv", "example-graph.jsonld", "capacity-committed.csv", "capacity-proposed.csv", "capacity-dom-committed.json", "capacity-dom-proposed.json"]
RESULTS["inputSha256"] = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in input_names}
(ROOT / "export-verification.json").write_text(json.dumps(RESULTS, indent=2) + "\n")
print(json.dumps({"status": RESULTS["status"], "totalChecks": RESULTS["totalChecks"], "failureCount": len(FAILURES), "checkCounts": dict(COUNTS), "failures": FAILURES}, indent=2))
raise SystemExit(bool(FAILURES))

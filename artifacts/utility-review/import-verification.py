#!/usr/bin/env python3
"""Verify captured import evidence against independently defined fictional CSVs.

Reads files only. Does not import app code, call APIs, operate a browser or access SQLite.
Run from any directory: python3 /absolute/path/to/import-verification.py
"""
import csv
import hashlib
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
FIXTURES = ROOT / 'import-fixtures'
checks = []
inputs = {}

def read_json(name):
    path = ROOT / name
    content = path.read_bytes()
    inputs[name] = hashlib.sha256(content).hexdigest()
    return json.loads(content)

def csv_rows(name):
    path = FIXTURES / name
    inputs['import-fixtures/' + name] = hashlib.sha256(path.read_bytes()).hexdigest()
    with path.open(newline='') as file:
        return list(csv.DictReader(file))

def check(name, actual, expected):
    passed = actual == expected
    entry = {'check': name, 'passed': passed}
    if not passed:
        entry.update(actual=actual, expected=expected)
    checks.append(entry)


def people_from_csv(name):
    # Explicit independent interpretation of the fixture's declared source contract.
    crafts = {'Product Design': 'design', 'UX Research': 'research'}
    return [{
        'id': r['Employee ID'], 'name': r['Full name'], 'craft': crafts[r['Discipline']],
        'fte': float(r['Working time (FTE)']), 'nonProjectPct': float(r['Non-project time (%)']),
        'title': r['Job title'], 'team': r['Team'], 'managerId': r['Manager ID'] or None,
        'isLeader': {'Yes': True, 'No': False}[r['Leader']],
    } for r in csv_rows(name)]


def projects_from_csv(name):
    values = {
        'Commitment': {'Committed': 'committed', 'Proposed': 'proposed'},
        'Importance': {'Top priority': 'top', 'High priority': 'high', 'Normal': 'normal'},
        'Project health': {'Decision required': 'needs_decision', 'On track': 'on_track', 'At risk': 'at_risk', 'No update yet': 'not_reported'},
        'Delivery status': {'In progress': 'in_progress', 'Planned': 'planned'},
    }
    return [{
        'id': r['Project ID'], 'name': r['Project name'], 'start': r['Start date'], 'end': r['End date'],
        'status': values['Commitment'][r['Commitment']],
        'effort': {'design': float(r['Design effort']), 'research': float(r['Research effort']), 'content': float(r['Content effort']), 'design_eng': float(r['Design engineering effort'])},
        'leadId': r['Project owner ID'] or None,
        'memberIds': r['Contributor IDs'].split('|') if r['Contributor IDs'] else [],
        'dependsOn': r['Dependency IDs'].split('|') if r['Dependency IDs'] else [],
        'importance': values['Importance'][r['Importance']], 'health': values['Project health'][r['Project health']],
        'decision': r['Action required'], 'update': r['Latest update'], 'priority': r['Business priority'],
        'summary': r['Expected outcome'], 'delivery': values['Delivery status'][r['Delivery status']], 'owner': '',
    } for r in csv_rows(name)]


def by_id(rows):
    return {r['id']: r for r in rows}

baseline = read_json('import-baseline-persisted.json')
saved = read_json('import-after-save.json')
expected_people = people_from_csv('baseline-people.csv')
expected_projects = projects_from_csv('baseline-projects.csv')
people_update = people_from_csv('update-people.csv')
projects_update = projects_from_csv('update-projects.csv')
check('Baseline revision is 1', baseline['revision'], 1)
check('Baseline people exactly match CSV fields', by_id(baseline['people']), by_id(expected_people))
check('Baseline projects exactly match CSV fields', by_id(baseline['initiatives']), by_id(expected_projects))
for name in ['import-review-unsaved.json', 'import-invalid-manager-unsaved.json', 'import-invalid-status-unsaved.json']:
    check(name + ' exactly preserves baseline records and revision', read_json(name), baseline)

merged_people = {**by_id(expected_people), **by_id(people_update)}
merged_projects = {**by_id(expected_projects), **by_id(projects_update)}
check('Saved revision advances exactly once from 1 to 2', saved['revision'], baseline['revision'] + 1)
check('Saved people count', len(saved['people']), 6)
check('Saved projects count', len(saved['initiatives']), 4)
check('Saved people exactly match expected merge with no extra or defaulted fields', by_id(saved['people']), merged_people)
check('Saved projects exactly match expected merge with no extra or defaulted fields', by_id(saved['initiatives']), merged_projects)
check('Person IDs are unique', len(set(p['id'] for p in saved['people'])), len(saved['people']))
check('Project IDs are unique', len(set(p['id'] for p in saved['initiatives'])), len(saved['initiatives']))
for dataset, before, after, expected_new, expected_updated in [
    ('People', by_id(expected_people), by_id(saved['people']), ['0030'], ['0010']),
    ('Projects', by_id(expected_projects), by_id(saved['initiatives']), ['UX-004'], ['UX-001']),
]:
    check(dataset + ' new record IDs', sorted(set(after) - set(before)), expected_new)
    check(dataset + ' changed existing record IDs', sorted(k for k in before if k in after and before[k] != after[k]), expected_updated)
    check(dataset + ' removed record IDs', sorted(set(before) - set(after)), [])
for key in ['0001', '0011', '0020', '0021']:
    check('Omitted person ' + key + ' retained unchanged', by_id(saved['people'])[key], by_id(expected_people)[key])
for key in ['UX-002', 'UX-003']:
    check('Omitted project ' + key + ' retained unchanged', by_id(saved['initiatives'])[key], by_id(expected_projects)[key])
check('Leader ID 0010 retains leading zeros and gains new name', by_id(saved['people'])['0010']['name'], 'Avery Chen')
check('New report ID 0030 retains leading zeros and correct manager', by_id(saved['people'])['0030']['managerId'], '0010')
check('Existing project owner retains ID despite rename', by_id(saved['initiatives'])['UX-001']['leadId'], '0010')

ui_graph = read_json('imported-graph.jsonld')
api_graph = read_json('import-api-graph.jsonld')
check('Downloaded UI graph exactly matches API graph', ui_graph, api_graph)
check('Graph revision matches saved workspace', ui_graph['revision'], 2)
check('Graph node count (6 people + 4 projects + 3 priorities)', len(ui_graph['@graph']), 13)
node_map = {n['@id']: n for n in ui_graph['@graph']}
check('Graph IDs are unique', len(node_map), 13)

person_urn = lambda key: 'urn:periscope:person:' + quote(key, safe="~()*!.'-")
project_urn = lambda key: 'urn:periscope:project:' + quote(key, safe="~()*!.'-")
priority_urn = lambda key: 'urn:periscope:priority:' + quote(key, safe="~()*!.'-")
expected_nodes = []
for p in merged_people.values():
    n = {'@id': person_urn(p['id']), '@type': 'schema:Person', 'schema:name': p['name'], 'schema:jobTitle': p['title'], 'team': p['team']}
    if p['managerId']:
        n['reportsTo'] = {'@id': person_urn(p['managerId'])}
    expected_nodes.append(n)
for label in sorted(set(p['priority'] for p in merged_projects.values())):
    expected_nodes.append({'@id': priority_urn(label), '@type': 'Priority', 'schema:name': label})
for p in merged_projects.values():
    n = {'@id': project_urn(p['id']), '@type': 'schema:Project', 'schema:name': p['name'], 'schema:description': p['summary'],
         'schema:startDate': p['start'], 'schema:endDate': p['end'], 'deliveryStatus': p['delivery'], 'health': p['health'],
         'importance': p['importance'], 'commitment': p['status'], 'weeklyEffort': p['effort'],
         'ledBy': {'@id': person_urn(p['leadId'])}, 'contributors': [{'@id': person_urn(key)} for key in p['memberIds']],
         'dependsOn': [{'@id': project_urn(key)} for key in p['dependsOn']], 'supports': {'@id': priority_urn(p['priority'])}}
    expected_nodes.append(n)
check('Every graph field and relationship matches independent CSV-derived expectation', node_map, {n['@id']: n for n in expected_nodes})
link_counts = {}
for relation in ['reportsTo', 'ledBy', 'contributors', 'dependsOn', 'supports']:
    refs = []
    for n in ui_graph['@graph']:
        v = n.get(relation, [])
        refs.extend(v if isinstance(v, list) else [v])
    check('All ' + relation + ' references resolve to graph IDs', all(r['@id'] in node_map for r in refs), True)
    link_counts[relation] = len(refs)
check('Relationship totals', link_counts, {'reportsTo': 5, 'ledBy': 4, 'contributors': 6, 'dependsOn': 2, 'supports': 4})

report = {
    'result': 'pass' if all(c['passed'] for c in checks) else 'fail',
    'method': 'File-only independent Python verification against fictional baseline/update CSVs and previously stated expected-results.md. No app helpers, API calls, browser operations or SQLite access.',
    'input_sha256': inputs,
    'summary': {'checks': len(checks), 'passed': sum(c['passed'] for c in checks), 'failed': sum(not c['passed'] for c in checks),
                'before': {'revision': baseline['revision'], 'people': len(baseline['people']), 'projects': len(baseline['initiatives'])},
                'after': {'revision': saved['revision'], 'people': len(saved['people']), 'projects': len(saved['initiatives'])},
                'graph_nodes': len(ui_graph['@graph']), 'graph_relationships': link_counts},
    'checks': checks,
    'limits': ['Snapshots prove state at their capture times; this file-only verification does not independently observe browser clicks, errors, mapping labels or cancel actions.',
               'UI graph export and API graph content parity is verified; rendered map/grid/detail usability must be established from the manager browser evidence.'],
}
(ROOT / 'import-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'result': report['result'], **report['summary']}, indent=2))
raise SystemExit(0 if report['result'] == 'pass' else 1)

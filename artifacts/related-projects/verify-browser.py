"""Replay browser checks against the isolated fictional workspace on port 3022."""
from pathlib import Path
import json, subprocess, sys, urllib.request
ROOT=Path(__file__).resolve().parent
expected=json.loads((ROOT/'expected-relations.json').read_text())
results={}

def run(*args):
    result=subprocess.run([sys.executable,str(ROOT/'browser.py'),*args],capture_output=True,text=True,timeout=30)
    if result.returncode: raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()

def click(selector):
    run('click',selector)
    run('snapshot','-i')

def read(script): return json.loads(run('eval',script))

def plan():
    with urllib.request.urlopen('http://127.0.0.1:3022/api/plan',timeout=5) as response: return json.load(response)

before=plan()
(ROOT/'isolated-plan-before.json').write_text(json.dumps(before,indent=2)+'\n')
if read('Boolean(document.querySelector(".leadership-project-detail[open]"))'):
    click('[aria-label="Close project"]')
inspector='''({title:document.querySelector('.map-inspector h3').textContent,connections:[...document.querySelectorAll('.map-related-item')].map(el=>({name:el.querySelector('strong').textContent,reason:el.querySelector('small').textContent}))})'''
detail='''({title:document.querySelector('#lead-project-title').textContent,heading:[...document.querySelectorAll('.leadership-project-detail h3')].find(el=>el.textContent.startsWith('Related projects')).textContent,focused:document.activeElement.id,scrollTop:document.querySelector('.leadership-project-detail .drawer-body').scrollTop,rows:[...document.querySelectorAll('.related-detail')].map(el=>({name:el.querySelector('strong').textContent.replace(/ →$/, ''),reasons:el.querySelector('small').textContent.split(' · ')}))})'''
for identity,item in expected.items():
    click('.map-view-switch button:nth-child(1)')
    selector='[data-node-id="urn:periscope:project:'+identity+'"]'
    # Exercise native keyboard activation for the focusable map node.
    run('eval','document.querySelector('+json.dumps(selector)+').focus()')
    run('press','Enter')
    run('snapshot','-i')
    mapped=read(inspector)
    assert mapped['title']==item['name'], (identity,mapped)
    dependencies=sorted((r['name'],r['reason']) for r in mapped['connections'] if r['reason'] in ('Depends on','Needed by'))
    target=sorted([(expected[k]['name'],'Depends on') for k in item['dependsOn']]+[(expected[k]['name'],'Needed by') for k in item['neededBy']])
    assert dependencies==target,(identity,dependencies,target)
    click('.map-view-switch button:nth-child(2)')
    grid=read(inspector)
    assert grid==mapped,(identity,'map/grid disagreement')
    assert read('Boolean(document.querySelector('+json.dumps('[data-grid-node-id="urn:periscope:project:'+identity+'"][aria-pressed="true"]')+'))')
    click('.primary.map-open-button')
    actual=read(detail)
    assert actual['title']==item['name']
    assert actual['heading']==f"Related projects ({item['count']})"
    assert actual['focused']=='lead-project-title' and actual['scrollTop']==0
    rows=[{'name':r['name'],'reasons':r['reasons']} for r in item['related']]
    assert actual['rows']==rows,(identity,actual['rows'],rows)
    results[identity]={'map':mapped,'grid':grid,'detail':actual,'status':'pass'}
    if identity in ('ai-research','opening'):
        run('scrollintoview','.related-detail:last-of-type')
        run('screenshot',str(ROOT/(identity+'-complete-details.png')))
    click('[aria-label="Close project"]')
    (ROOT/'browser-verification.json').write_text(json.dumps({'status':'in progress','projects':results},indent=2)+'\n')
    print(identity+': map/grid/detail passed',flush=True)
run('download','[aria-label="Export connected data"]',str(ROOT/'graph-export.jsonld'))
graph=json.loads((ROOT/'graph-export.jsonld').read_text())
actual_edges=sorted((node['@id'].split(':')[-1],ref['@id'].split(':')[-1]) for node in graph['@graph'] if node['@type']=='schema:Project' for ref in node['dependsOn'])
expected_edges=sorted((identity,ref) for identity,item in expected.items() for ref in item['dependsOn'])
assert actual_edges==expected_edges and len(actual_edges)==7
for node in graph['@graph']:
    if node['@type']=='schema:Project':
        item=expected[node['@id'].split(':')[-1]]
        assert node['schema:name']==item['name']
after=plan()
assert after==before,'Read-only navigation changed isolated saved Plan'
(ROOT/'isolated-plan-after.json').write_text(json.dumps(after,indent=2)+'\n')
errors=run('errors'); console=run('console')
assert not errors and not console,(errors,console)
report={'status':'pass','projectCount':len(results),'dependencyEdgeCount':len(actual_edges),'isolatedSavedPlanUnchanged':True,'browserErrors':errors,'browserConsole':console,'method':'Real DOM and native keyboard/click interaction through agent-browser; expected rows independently derived from fictional raw records, no product helpers. Map and grid selected-item panels compared for all projects; full detail rows and downloaded graph checked.','projects':results}
(ROOT/'browser-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: 13 project detail lists, map/grid selected connections, 7 exported dependency edges; no saved-data change.',flush=True)

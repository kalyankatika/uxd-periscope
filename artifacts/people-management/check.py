"""Read-only assertions against the isolated fictional hierarchy workspace."""
import json,pathlib,sys,urllib.request
root=pathlib.Path(__file__).resolve().parent
stage=sys.argv[1]
plan=json.load(urllib.request.urlopen('http://127.0.0.1:3024/api/plan'))
by_id=lambda records:{record['id']:record for record in records}
load=lambda name:json.loads((root/(name+'.json')).read_text())
if stage=='added':
 baseline=load('baseline'); old={p['id'] for p in baseline['people']}
 added=[p for p in plan['people'] if p['id'] not in old]
 assert len(added)==1 and len(plan['people'])==27
 p=added[0]
 assert (p['name'],p['managerId'],p['team'],p['craft'],p['fte'],p['nonProjectPct'])==('Taylor Stone','marcus','Research & insights','research',.83,12.5)
 assert by_id(plan['initiatives'])==by_id(baseline['initiatives']) and plan['revision']==2
elif stage=='moved':
 previous=load('baseline')
 new=[p for p in plan['people'] if p['id'] not in by_id(previous['people'])]
 assert len(new)==1
 added=new[0]
 assert (added['name'],added['managerId'],added['team'],added['craft'],added['fte'],added['nonProjectPct'])==('Taylor Stone','marcus','UX AI','research',.83,12.5)
 previous['people'].append({**added,'team':'Research & insights'})
 changed={'marcus'}|{p['id'] for p in previous['people'] if p['managerId']=='marcus'}
 expected={p['id']:{**p,**({'managerId':'riley'} if p['id']=='marcus' else {}),**({'team':'UX AI'} if p['id'] in changed else {})} for p in previous['people']}
 assert {p['id']:p for p in plan['people']}==expected
 assert by_id(plan['initiatives'])==by_id(previous['initiatives']) and plan['revision']==3
elif stage=='removed':
 previous=load('moved')
 expected={p['id']:{**p,**({'managerId':'riley'} if p['managerId']=='marcus' else {})} for p in previous['people'] if p['id']!='marcus'}
 assert {p['id']:p for p in plan['people']}==expected
 expected_projects=[{**p,**({'leadId':'amara','owner':'Amara Nwosu'} if p['leadId']=='marcus' else {}),'memberIds':[i for i in p['memberIds'] if i!='marcus']} for p in previous['initiatives']]
 assert by_id(plan['initiatives'])==by_id(expected_projects) and plan['revision']==4
elif stage=='owner-removed':
 previous=load('removed')
 assert by_id(plan['people'])==by_id([p for p in previous['people'] if p['id']!='ethan'])
 expected_projects=[{**p,**({'leadId':'amara','owner':'Amara Nwosu'} if p['leadId']=='ethan' else {}),'memberIds':[i for i in p['memberIds'] if i!='ethan']} for p in previous['initiatives']]
 assert by_id(plan['initiatives'])==by_id(expected_projects) and plan['revision']==5
elif stage=='root-move':
 previous=load('owner-removed'); original={p['id'] for p in load('baseline')['people']}
 added=next(p['id'] for p in previous['people'] if p['id'] not in original)
 assert {p['id']:p for p in plan['people']}=={p['id']:{**p,**({'managerId':None} if p['id']==added else {})} for p in previous['people']}
 assert by_id(plan['initiatives'])==by_id(previous['initiatives']) and plan['revision']==6
elif stage in ('cancelled','reloaded'):
 assert plan==load('root-move')
else:raise ValueError(stage)
(root/(stage+'.json')).write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps({'stage':stage,'passed':True,'people':len(plan['people']),'projects':len(plan['initiatives']),'revision':plan['revision']}))

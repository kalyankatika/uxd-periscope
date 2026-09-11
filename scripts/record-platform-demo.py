"""Record Periscope's local fictional example with agent-browser.
Set AGENT_BROWSER_BIN and FFMPEG_BIN to installed executables. No production data is edited.
"""
import json, os, re, subprocess, time, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts/platform-demo'
WORK = Path(os.environ.get('DEMO_WORK_DIR', '/tmp/periscope-map-video'))
RAW = WORK / 'raw'; RAW.mkdir(parents=True, exist_ok=True)
BIN = os.environ['AGENT_BROWSER_BIN']
SESSION = 'periscope-map-demo'
URL = 'http://127.0.0.1:3000'
CHAPTERS = [
 ('01-map', '01 / WORK MAP', 'People, projects and priorities in one interactive graph.', 'Periscope connects twenty-six people, thirteen projects, and seven business priorities. Expand the work map to explore the organization. Zoom, move nodes, and highlight connections while keeping project and team information in view.'),
 ('02-project', '02 / PROJECT CONNECTIONS', 'Inspect owners, contributors, priorities and dependencies.', 'Select UX AI interaction standards to inspect the project and its direct connections. Focus the graph to reduce clutter, then increase the connection distance. Project details include the expected outcome, latest update, owner, dates, and requested effort.'),
 ('03-leader', '03 / TEAMS AND REPORTING', 'Review every project across a leader’s reporting structure.', 'Select a leader to see work across their reporting line. The UX AI team contributes to standards, research synthesis, and a conversational prototype. Open the team view to review shared projects and direct reports.'),
 ('04-attention', '04 / PRIORITIES AND DECISIONS', 'Focus on top priorities and projects that need attention.', 'Use the project filters to isolate top priorities or work needing attention. Selecting the conversational planning prototype reveals the decision required before client testing. These statuses come from explicit project updates, rather than inferred progress.'),
 ('05-overview', '05 / LEADERSHIP OVERVIEW', 'Review project health, priorities and seven leadership teams.', 'The overview summarizes project activity, top priorities, and items requiring attention. Leader cards show the work across Product Design, Research, Content Design, Design Systems, Design Strategy, Innovation, and UX AI.'),
 ('06-compare', '06 / PROJECT COMPARISON', 'Filter by team and status, then sort projects for review.', 'The project grid uses consistent fields for every project. Filter by a leader, sort by due date, and review the projects requiring attention. Owners, health, weekly effort, and requested actions remain visible together.'),
 ('07-capacity', '07 / CAPACITY AND PROJECT PLAN', 'Compare weekly demand with capacity, including proposed work.', 'Capacity compares weekly project demand with available time by discipline. Include proposed work to assess additional demand. The project plan separates committed, proposed, and backlog work for the selected quarter.'),
 ('08-import', '08 / ENTERPRISE DATA MAPPING', 'Review column mappings, labels and relationships before import.', 'Before importing enterprise data, review recognized column names and label mappings. The preview shows new, updated, and removed records, and validates reporting and project references. This demonstration imports only fictional example data into the temporary example session.'),
 ('09-close', '09 / CONNECTED WORKSPACE', 'Explore relationships. Review priorities. Plan capacity.', 'The same people and project relationships power the map, leadership views, comparison grid, and capacity plan. Real enterprise records can be prepared with stable identifiers and reviewed mappings. This video uses fictional data throughout.'),
]

def b(*args):
    result = subprocess.run([BIN, '--session', SESSION, *(str(round(a)) if isinstance(a,float) else str(a) for a in args)], capture_output=True, text=True, timeout=40)
    if result.returncode or '✗' in result.stdout + result.stderr:
        raise RuntimeError(str(args)+'\n'+result.stdout+result.stderr)
    return result.stdout.strip()

def ref(name, role='button', contains=False):
    snapshot = b('snapshot', '-i')
    for line in snapshot.splitlines():
        match = re.search(r'\b'+role+r' "([^"]*)".*\bref=(e\d+)\]', line)
        if match and ((name in match[1]) if contains else match[1].strip() == name):
            return '@'+match[2]
    (WORK/'failed-snapshot.txt').write_text(snapshot)
    raise RuntimeError('Missing '+role+': '+name)

def hold(seconds=2): time.sleep(seconds)
def click(name, contains=False):
    b('click', ref(name, contains=contains)); hold(.7)
def select(name, value): b('select', ref(name, role='combobox'), value); hold(.7)
def top(): b('eval', 'window.scrollTo({top:0,behavior:"instant"})'); hold(.5)
def expand(): click('Expand map'); hold(.5)
def project(name): click('Project: '+name, contains=True)
def leader(name): click('Leader: '+name, contains=True)
def nav(name): click(name, contains=True); top()
def capture(name): b('screenshot', WORK/(name+'.png'))
def ready():
    b('wait', '--fn', 'document.fonts.status === "loaded" && document.querySelectorAll(".map-node").length === 46')
    text = b('get','text','.example-banner')
    if 'Fictional organization' not in text: raise RuntimeError('Recording must use fictional example mode')

def actions(index):
    if index == 0:
        hold(3); expand(); hold(4)
        target = '[data-node-id="urn:periscope:project:experience-strategy"] > circle:first-of-type'
        bounds = {key: float(value) for key,value in re.findall(r'(x|y|width|height):\s*([\d.-]+)', b('get','box',target))}; x=bounds['x']+bounds['width']/2; y=bounds['y']+bounds['height']/2
        b('mouse','move',x,y); hold(2); b('mouse','down')
        for step in range(1,11): b('mouse','move',x+step*7,y-step*3); hold(.04)
        b('mouse','up'); b('mouse','move',200,160); hold(3)
        click('Zoom in'); hold(2); click('Fit'); hold(3)
    elif index == 1:
        project('UX AI interaction standards'); b('mouse','move',180,160); hold(4)
        click('◎ Focus connections'); hold(4); select('Connection distance','2'); hold(3)
        click('Open project details'); hold(5)
    elif index == 2:
        leader('Riley Thompson'); b('mouse','move',180,160); hold(4)
        click('◎ Focus connections'); hold(4)
        click('View team projects'); top(); hold(4); b('scroll','down',380); hold(4)
    elif index == 3:
        click('Top priorities', contains=True); hold(4)
        click('Needs attention', contains=True); hold(4)
        project('Conversational planning prototype'); b('mouse','move',180,160); hold(6)
    elif index == 4:
        hold(5); b('scroll','down',420); hold(4); b('scrollintoview','.teams-section'); hold(6)
    elif index == 5:
        hold(3); select('Team','riley'); hold(4); click('Due', contains=True); hold(3)
        select('Team',''); select('Filter','attention'); hold(5)
    elif index == 6:
        hold(5); b('check',ref('Include proposed',role='checkbox',contains=True)); hold(4)
        nav('Project plan'); hold(4); b('scroll','down',480); hold(4)
    elif index == 7:
        hold(3); select('Import type','initiatives'); hold(1)
        b('upload','input[type=file]', OUT/'projects-example.csv'); hold(3)
        if 'All rows and relationship references are valid.' not in b('get','text','dialog[open]'): raise RuntimeError('Import preview not valid')
        b('scrollintoview','dialog[open] .import-mapping:nth-of-type(1)'); hold(4)
        b('scrollintoview','dialog[open] .import-mapping:nth-of-type(2)'); hold(5)
        capture('import-mapping'); click('Import 13 records'); hold(3)
        if 'Example updated for this session.' not in b('get','text','body'): raise RuntimeError('Example import not completed')
    elif index == 8:
        click('Business priority: Responsible AI experiences. Show connections.'); b('mouse','move',180,160); hold(4)
        click('◎ Focus connections'); hold(4); click('Reset view'); hold(4)

start_index=int(sys.argv[1]) if len(sys.argv)>1 else 0
stop_index=int(sys.argv[2]) if len(sys.argv)>2 else len(CHAPTERS)
manifest_path=OUT/'chapters.json'
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else []
for index in range(start_index,stop_index):
    name,title,caption,narration = CHAPTERS[index]
    print('Recording '+title, flush=True)
    b('record','start', RAW/(name+'.webm'),URL)
    began=time.monotonic()
    try:
        ready()
        if index in [1,2,3,8]: expand()
        elif index==4: nav('Overview')
        elif index==5: nav('▦ Projects')
        elif index==6: nav('Capacity')
        elif index==7: nav('People & imports')
        trim=max(0,time.monotonic()-began)
        actions(index)
        capture(name)
        hold(.5)
    finally:
        b('record','stop')
    chapter=dict(name=name,title=title,caption=caption,narration=narration,trimStart=round(trim,3))
    if index < len(manifest): manifest[index]=chapter
    else: manifest.append(chapter)
    manifest_path.write_text(json.dumps(manifest,indent=2))
    print('Captured '+name,flush=True)
print('Recording complete',flush=True)

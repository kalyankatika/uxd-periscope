"""Add chapter captions and local synthesized narration to recorded demo clips.
Requires FFMPEG_BIN and macOS /usr/bin/say. Fonts are the app's Fidelity assets.
"""
import ast, json, os, re, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/platform-demo'
WORK=Path(os.environ.get('DEMO_WORK_DIR','/tmp/periscope-map-video'))
FF=os.environ['FFMPEG_BIN']
FONT=ROOT/'app/fonts/FidelitySans-Regular.woff'; BOLD=ROOT/'app/fonts/FidelitySans-Bold.woff'
def duration(path):
 r=subprocess.run([FF,'-hide_banner','-i',str(path)],capture_output=True,text=True)
 m=re.search(r'Duration: (\d+):(\d+):([\d.]+)',r.stderr)
 if not m:raise RuntimeError('Cannot read duration: '+str(path)+'\n'+r.stderr)
 return int(m[1])*3600+int(m[2])*60+float(m[3])
def tc(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
def narration(chapters):
 for c in chapters:
  name=c['name']; text=WORK/(name+'-narration.txt'); text.write_text(c['narration'])
  audio=WORK/(name+'.aiff')
  subprocess.run(['/usr/bin/say','-v','Samantha','-r','165','-f',str(text),'-o',str(audio)],check=True)
  print('Narration ready: '+name,flush=True)
if '--audio-only' in sys.argv:
 tree=ast.parse((ROOT/'scripts/record-platform-demo.py').read_text())
 data=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='CHAPTERS' for t in n.targets))
 narration([dict(name=n,title=t,caption=c,narration=a) for n,t,c,a in data]);sys.exit(0)
chapters=json.loads((OUT/'chapters.json').read_text())
if len(chapters)!=9:raise RuntimeError('Expected all nine recorded chapters')
renders=[]; elapsed=0; srt=[]; transcript=['# Periscope platform demo','', 'Fictional data. Narration uses a local synthesized voice.','']
for index,c in enumerate(chapters):
 source=WORK/'raw'/(c['name']+'.webm'); audio=WORK/(c['name']+'.aiff')
 if not audio.exists():narration([c])
 trim=c['trimStart']; seconds=max(duration(source)-trim, duration(audio)+1.7)
 title=WORK/(c['name']+'-title.txt'); caption=WORK/(c['name']+'-caption.txt')
 title.write_text(c['title']);caption.write_text(c['caption'])
 output=WORK/(c['name']+'.mp4')
 vf=f"setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=30,scale=1664:936:flags=lanczos,pad=1920:1080:128:0:color=0x14231a,setsar=1,drawbox=x=0:y=936:w=1920:h=3:color=0x368727:t=fill,drawtext=expansion=none:fontfile='{BOLD}':textfile='{title}':fontcolor=0xa2df94:fontsize=24:x=64:y=960,drawtext=expansion=none:fontfile='{FONT}':textfile='{caption}':fontcolor=white:fontsize=26:x=64:y=1006,drawtext=expansion=none:fontfile='{FONT}':text='FICTIONAL DATA  /  Q4 2026':fontcolor=0xb1bcb4:fontsize=17:x=1570:y=967"
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-ss',str(trim),'-i',str(source),'-i',str(audio),'-vf',vf,'-af','adelay=700,apad','-t',str(seconds),'-r','30','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','48000','-ac','2',str(output)],check=True)
 c['startSeconds']=round(elapsed,2);c['durationSeconds']=round(seconds,2)
 srt.append(f'{index+1}\n{tc(elapsed)} --> {tc(elapsed+seconds)}\n{c["title"]}\n{c["caption"]}\n')
 transcript += [f'## {int(elapsed)//60:02}:{int(elapsed)%60:02} — {c["title"]}', '', c['narration'],'']
 elapsed+=seconds;renders.append(output)
 print('Rendered '+c['name']+' ('+str(round(seconds,1))+' seconds)',flush=True)
concat=WORK/'concat.txt'; concat.write_text(''.join("file '"+str(p)+"'\n" for p in renders))
subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(OUT/'periscope-platform-demo.mp4')],check=True)
(OUT/'chapters.json').write_text(json.dumps(chapters,indent=2));(OUT/'periscope-platform-demo.srt').write_text('\n'.join(srt));(OUT/'transcript.md').write_text('\n'.join(transcript))
print('Final duration: '+str(round(elapsed,2)),flush=True)
